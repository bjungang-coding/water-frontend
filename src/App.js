import './App.css';
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

function App() {
  const dataMap = {
    Fe: 'Fe',
    Pb: 'Pb',
    Cd: 'Cd',
  };


  let dataSet = {
    title: '로딩중...',
    liveConcentration: '0',
    lastupdate: '',
    record: [],
  }
  const [data, setData] = useState(dataSet);

  const fetchData = useCallback((table) => {
    setData(dataSet)
    axios
      .get(`http://ec2-43-200-4-147.ap-northeast-2.compute.amazonaws.com/get?table=${table}`)
      .then((result) => {
        setData(result.data.data);
      })
      .catch(() => {
        console.log('실패함');
      });
  }, []);

  useEffect(() => {
    fetchData('Fe');
  }, [fetchData]);


  const settingHeader = () => {
    Swal.fire({
      title: '환경설정',
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '웹훅 설정',
      denyButtonText: `데이터 초기화`,
      cancelButtonText: '취소',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        webhookSet(); 
      } else if (result.isDenied) {
        handleDataReset();
      }
    })
  }

  const webhookSet = () => {
    Swal.fire({
      input: 'url',
      inputLabel: 'Discord Webhook',
      inputPlaceholder: 'url을 입력해주세요.'
    }).then((url_) => {
      if (url_) {
        if (url_.value == null) {
          Swal.fire({icon: 'warning', text:`URL값이 비어있습니다.`})
        } else {
          axios.post("http://ec2-43-200-4-147.ap-northeast-2.compute.amazonaws.com/update/webhook?url="+ url_.value, {
          }).then(res => {
            Swal.fire({icon: "success", text: "웹훅 url을 업데이트 완료했습니다!"})
          }).catch(error => {
            Swal.fire({icon: "error", title: "업데이트 실패!", text: `사유 : ${error}`})
          })
          
        }
      }
    })
  }


  const handleDataReset = () => {
    Swal.fire({
      icon: 'warning',
      title: '삭제',
      text: '모든 데이터를 삭제 하시겠습니까?',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
    }).then((res) => {
      if (res.isConfirmed) {
        axios.get('http://ec2-43-200-4-147.ap-northeast-2.compute.amazonaws.com/reset').then((res) => {
          console.log('삭제완료');
          Swal.fire({
            icon: 'success',
            title: '삭제완료!',
            text: '모든 데이터를 삭제했습니다.',
            confirmButtonText: '확인',
          }).then((res) => {
            window.location.reload();
          });
        });
      } else {
        console.log('ㄴㄴ');
      }
    });
  };

  return (
    <div className="App">
      <div className="container h_screen">
        <div className="h_screen flex justify-center item-center">
          <div className="box">
            <header className="box_header flex">
              <div className="title">수질오염 실시간 측정 프로그램 v1.0.0</div>
              <div style={{ marginRight: 'auto' }}></div>
              <div className="title delete" onClick={settingHeader}>
                설정
              </div>
            </header>
            <div className="flex">
              <div className="flex side_bar flex_col">
                {Object.keys(dataMap).map((key) => (
                  <div
                    key={key}
                    className="flex choose_box"
                    onClick={() => fetchData(dataMap[key])}
                  >
                    <div className="flex justify-center item-center" style={{ width: '100%' }}>
                      <p className="choose_text">{dataMap[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="main">
                <Content data={data}></Content>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Content({ data }) {
  return (
    <div className="content">
      <h2>- {data.title}</h2>
      <hr style={{ color: '#fff', borderTopWidth: '1px' }}></hr>
      <h3>최근 농도 : {data.liveConcentration} ppb</h3>
      <p className="lastupdate">마지막 업데이트 시각 : 2023년 10월 19일 오후 8시 10분</p>
      <hr style={{ color: '#fff', borderTopWidth: '1px' }}></hr>
      <div style={{ marginTop: '30px' }}></div>
      <div></div>
      <h3>업데이트 기록</h3>
      <div style={{ marginTop: '10px' }}></div>
      <Table record={data.record} />
    </div>
  );
}

function Table({ record }) {
  return (
    <div className="updatebox">
      {record.map((data_) => (
        <div className="updatein" key={data_.date}>
          <h3>{data_.date}</h3>
          <p className="lastupdate">측정 농도 : {data_.ppb} ppb</p>
        </div>
      ))}
    </div>
  );
}

export default App;
