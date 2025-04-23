import React, { useEffect, useState } from 'react';
import { ListGroup } from 'react-bootstrap';
import './DanhBa.scss';
import FriendsList from './FriendsList';
import GroupsList from './GroupsList';
import FriendRequest from './FriendRequest';
import GroupRequest from './GroupRequest';
import { Search, UserPlus, Users } from 'lucide-react';
import AddFriendModal from '../../component/AddFriendModal';
import { getFriendRequestsService } from '../../service/friendRequestService';


const DanhBa = (props) => {
  const [activeTab, setActiveTab] = useState('Danh sách bạn bè');
  const socketRef = props.socketRef

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const friendRequests = props.friendRequests;
  const setFriendRequests = props.setFriendRequests;
  const groupRequests = props.groupRequests;
  const setGroupRequests = props.setGroupRequests;


  useEffect(() => {
    const getFriendRequests = async () => {
      const response = await getFriendRequestsService();
      setFriendRequests(response.DT);
    };

    socketRef.current.on("RES_ADD_FRIEND", getFriendRequests);
    socketRef.current.on("RES_REJECT_FRIEND", getFriendRequests);

    // Cleanup
    return () => {
      socketRef.current.off("RES_ADD_FRIEND", getFriendRequests);
      socketRef.current.off("RES_REJECT_FRIEND", getFriendRequests);
    };
  }, [socketRef]);
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleCloseSearch = () => {
    setIsSearchFocused(false);
  };
  const [showModalAddFriend, setShowModalAddFriend] = useState(false);

  // Render nội dung dựa trên tab đang chọn
  const renderContent = () => {
    switch (activeTab) {
      case 'Danh sách bạn bè':
        return <FriendsList />;
      case 'Danh sách nhóm và cộng đồng':
        return <GroupsList />;
      case 'Lời mời kết bạn':
        return <FriendRequest socketRef={socketRef} />;
      case 'Lời mời vào nhóm và cộng đồng':
        return <GroupRequest socketRef={socketRef} />;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row h-100 g-0 ">
        <div
          className="col-3 border-end bg-white"
          style={{ maxWidth: "300px" }}
        >
          {/*  Search */}
          <div className="p-2 border-bottom">
            <div className="d-flex align-items-center pb-3">
              <div className="input-group me-3">
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  placeholder="Tìm kiếm"
                  onFocus={handleSearchFocus}
                />
                <button className="btn btn-light  cursor-pointer border">
                  <Search size={16} />
                </button>
              </div>

              {isSearchFocused ? (
                <button
                  className="btn btn-light rounded-circle mb-1"
                  onClick={handleCloseSearch}
                >
                  Đóng
                </button>) : (
                <>
                  <button className="btn btn-light rounded-circle mb-1"
                    onClick={() => setShowModalAddFriend(true)}
                  >
                    <UserPlus size={20} />
                  </button>

                  <AddFriendModal
                    show={showModalAddFriend}
                    onHide={() => setShowModalAddFriend(false)}
                    socketRef={socketRef}
                  />
                  <button className="btn btn-light rounded-circle mb-1">
                    <Users size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
          {/* Sidebar */}
          <div className="">
            <ListGroup>
              <ListGroup.Item
                active={activeTab === 'Danh sách bạn bè'}
                onClick={() => setActiveTab('Danh sách bạn bè')}
              >
                Danh sách bạn bè
              </ListGroup.Item>
              <ListGroup.Item
                active={activeTab === 'Danh sách nhóm và cộng đồng'}
                onClick={() => setActiveTab('Danh sách nhóm và cộng đồng')}
              >
                Danh sách nhóm và cộng đồng
              </ListGroup.Item>
              <ListGroup.Item
                active={activeTab === 'Lời mời kết bạn'}
                onClick={() => setActiveTab('Lời mời kết bạn')}
                className="d-flex justify-content-between align-items-center"
              >
                <span>Lời mời kết bạn</span>
                {friendRequests.length > 0 && (
                  <span className="badge bg-primary rounded-pill">
                    {friendRequests.length}
                  </span>
                )}
              </ListGroup.Item>
              <ListGroup.Item
                active={activeTab === 'Lời mời vào nhóm và cộng đồng'}
                onClick={() => setActiveTab('Lời mời vào nhóm và cộng đồng')}
                className="d-flex justify-content-between align-items-center"
              >
                <span>Lời mời vào nhóm </span>
                {groupRequests.length > 0 && (
                  <span className="badge bg-primary rounded-pill">
                    {groupRequests.length}
                  </span>
                )}
              </ListGroup.Item>
            </ListGroup>
          </div>

        </div>
        {/* Nội dung */}
        <div className="col">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DanhBa;