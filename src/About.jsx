import React from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import "./css/Home.css";
import AOS from "aos";
import { useEffect } from "react";

export default function About() {
  
  useEffect(() => {
    AOS.init({ duration: 1300,disable: window.innerWidth < 825 });
    AOS.refresh();
  }, []);

  return (
  <div className="About-page">
  <div className="Home">
    <Navbar />
    <div
      className="About"
      style={{
        paddingLeft: "1em",
        paddingRight: "1em",
      }}
      data-aos="fade-up" data-aos-delay="100"
    >
      <h1 className="about-heading" data-aos="fade-up">About Us</h1>
      <p id="set-footer-in-about" data-aos="fade-up" data-aos-delay="200" className="about-para" style={{
        opacity:"65%"
      }}>
        Developed by Pradeep and Amit, students of Delhi Technological
        University, Study Rooms aims at bringing various people of similar
        interests together to form a global community.
      </p>
      <div id="about-footer" data-aos="fade-up">
      <Footer />
      </div>
    </div>
  </div>
    </div>
  );
}
