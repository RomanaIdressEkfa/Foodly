export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <h3>Stay Connected</h3>
            <div className="social-row">
              <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}><path d="M13.5 9H16V6h-2.5C11.6 6 10 7.6 10 9.9V12H8v3h2v6h3v-6h2.3l.5-3H13v-1.7c0-.6.3-1.3 1.5-1.3Z"/></svg></a>
              <a href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}><path d="M6.9 8.6H4V20h2.9zM5.4 4C4.4 4 3.6 4.8 3.6 5.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8S6.4 4 5.4 4zM20 20h-2.9v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V20H10.2V8.6H13v1.6c.5-.8 1.5-1.6 3.1-1.6 3.3 0 3.9 2.2 3.9 5V20z"/></svg></a>
              <a href="#" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="currentColor" style={{ color: '#fff' }}><path d="M21 5.9c-.7.3-1.4.5-2.2.6.8-.5 1.4-1.2 1.6-2.2-.7.5-1.6.8-2.4 1-.7-.8-1.7-1.2-2.8-1.2-2.1 0-3.8 1.7-3.8 3.9 0 .3 0 .6.1.9C8.4 8.7 5.6 7.2 3.7 4.8c-.3.6-.5 1.2-.5 1.9 0 1.4.7 2.6 1.7 3.3-.6 0-1.2-.2-1.7-.5v.1c0 1.9 1.3 3.5 3.1 3.9-.3.1-.7.1-1 .1-.3 0-.5 0-.7-.1.5 1.6 2 2.7 3.7 2.8-1.3 1.1-3 1.7-4.9 1.7H3c1.7 1.1 3.8 1.8 5.9 1.8 7.1 0 11-6 11-11.1v-.5c.8-.5 1.4-1.2 1.9-2z"/></svg></a>
              <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1"/></svg></a>
            </div>
            <div className="pay-row">
              <span>G Pay</span><span>PayPal</span><span className="pay-visa">VISA</span>
            </div>
          </div>

          <div>
            <h3>Get 20% Discount On Your First Order.</h3>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Email Address" required />
              <button type="submit">Send Now</button>
            </form>
          </div>

          <div>
            <h3>Services</h3>
            <ul><li><a href="#">Membership</a></li><li><a href="#">Products</a></li><li><a href="#">Stories</a></li></ul>
          </div>
          <div>
            <h3>About Us</h3>
            <ul><li><a href="#">About Us</a></li><li><a href="#">Our Mission</a></li><li><a href="#">Subscription</a></li></ul>
          </div>
          <div>
            <h3>Address</h3>
            <ul><li>Morocco,</li><li>Marrakesh 29</li><li>Plaza World</li></ul>
          </div>
        </div>
        <div className="foot-bottom">Copyright © 2026 Foodly. All rights reserved.</div>
      </div>
    </footer>
  );
}
