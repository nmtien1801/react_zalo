import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";

const Header = () => {
  return (
    <Navbar
      className="bg-body-tertiary shadow-sm d-flex flex-column vh-100 border border-dark w-25"
      sticky="top"
    >
      <Container fluid className="d-flex flex-column align-items-start">
        {/* Logo hoặc tên ứng dụng */}
        <Navbar.Brand as={NavLink} to="/login" className="fw-bold">
          Zalo
        </Navbar.Brand>

        {/* Phần nội dung menu */}
        <Nav className="d-flex flex-column w-100">
          <Nav.Link as={NavLink} to="/chat" className="fw-normal">
            Chat
          </Nav.Link>
          <Nav.Link as={NavLink} to="/danh-ba" className="fw-normal">
            Danh ba
          </Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
