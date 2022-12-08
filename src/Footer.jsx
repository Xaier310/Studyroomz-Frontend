import React from "react";
import "./css/Footer.css";
export default function Footer() {
  return (
    <div className="footer-wrapper">
      <div className="r1">
        <div className="links">
          <h1> Important Links</h1>
          <ul>
            <li><a href="https://github.com/Xaier310/"><i className="fab fa-github"></i> Github</a></li>
            <li><a href="https://www.instagram.com/pravish310/"><i className="fab fa-instagram"></i> Instagram</a></li>
            <li><a href="https://www.facebook.com/pradeep.kr.16568/"><i className="fab fa-facebook"></i> Facebook</a></li>
          </ul>
        </div>
        <div id="contact-us-form" className="contactus-footer">
          <h1>Contact US</h1>

          <h3>Have any queries feel free to reach out</h3>
          <form className="signup">
            <br />

            <input
              name="Name"
              type="text"
              placeholder="Name*"
              className="username"
              id="input"
            />
            <textarea id="input" type="text" placeholder="Message" />

            <button className="btn">Send Message</button>
          </form>
        </div>
      </div>
      <div className="r2">
        <div>
          <p id="copyright">© 2021 Studyroom copyright</p>
        </div>
      </div>
    </div>
  );
}
