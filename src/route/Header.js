import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";


import AccountSetting from "../page/accountSetting/accountSetting";

import "./Header.css";

const Header = () => {

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');

  return (
    <Navbar className="main-tab"sticky="top" >

      <Container fluid className="nav__tabs__top">

        <div class="nav__tabs__zalo web" title="Võ Trường Khang">
          <div class="rel zavatar-container clickable" idelement="avatar">
            <div class="zavatar zavatar-l zavatar-single flx flx-al-c flx-center rel disableDrag clickable">
              <img src="https://s120-ava-talk.zadn.vn/2/2/d/9/20/120/0e029b40ab888036e163cd19734fe529.jpg" class="a-child" />
            </div>
          </div>
        </div>

        {/* Phần nội dung menu */}
        <Nav className="d-flex flex-column w-100">
          <Nav.Link as={NavLink} to="/chat" className="leftbar-tab clickable">
            <div class="mmi-icon-wr">
              <div class="z-noti-badge-container">
                <div class="z-noti-badge --big --counter --noti-enable --anchor --top-right leftbar-unread-badge">
                  <i class="fa fa-5_Plus_24_Line z-noti-badge__content --big"></i>
                </div>
                <i class="fa fa-comment internal-icon"></i>
              </div>
            </div>
          </Nav.Link>
          <Nav.Link as={NavLink} to="/danh-ba" className="leftbar-tab clickable">
            <div class="mmi-icon-wr">
              <div class="z-noti-badge-container">
                <i class="fa fa-address-book internal-icon"></i>
              </div>
            </div>
          </Nav.Link>
        </Nav>
      </Container>
      <Container className="nav__tabs__bottom">
        <AccountSetting
            handleClose={() => setShowModal(false)}
            content={modalContent}
        />
      </Container>
    </Navbar>
  );
};


export default Header;
