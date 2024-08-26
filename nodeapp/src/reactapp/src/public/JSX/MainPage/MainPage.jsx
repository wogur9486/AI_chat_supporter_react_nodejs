import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../CSS/MainPage.css';

export default function MainPage() {
    
    const [nickName, setNickName] = useState('');
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // WebSocket을 설정하고 연결
        const ws = new WebSocket('http://192.168.0.154:5050'); // 여기에 실제 WebSocket 서버 주소를 입력하세요
        setSocket(ws);

        // 컴포넌트가 언마운트될 때 WebSocket을 닫습니다.
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    const handleNickNameSubmit = () => {
        if (nickName && socket) {
            // WebSocket을 통해 서버로 닉네임과 함께 'enter_room' 이벤트를 보냅니다.
            socket.onopen = () => {
                socket.send(JSON.stringify({ event: 'enter_room', nickName, roomName: 'room1' }));
            };

            navigate('/chatListPage', { state: { 'nickName': nickName } });
        }
    }
    
    const keypress = (e) => {
        if (e.key === 'Enter') {
            handleNickNameSubmit();
        }
    };

    return (
        <div className="pullpage">
            <div className="MainPage">
                <div className="Main">
                    AI CHAT SUPPORTER
                    <input 
                        type='text' 
                        name='nickName'
                        placeholder="닉네임 입력" 
                        onChange={(e) => setNickName(e.target.value)} 
                        onKeyDown={keypress}
                    />
                    <button onClick={handleNickNameSubmit}>입장하기</button>
                </div>
            </div>
        </div>
    );
}
