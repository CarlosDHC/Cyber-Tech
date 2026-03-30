
import React from 'react';
import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <p>&copy; {new Date().getFullYear()} Cyber-Tech. Todos os direitos reservados.</p>
        <div className={styles.footerLinks}>
          <a href="/sobre">Sobre</a>
          <a href="/privacidade">Privacidade</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;