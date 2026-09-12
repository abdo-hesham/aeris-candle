"use client";

import Image from "next/image";
import { useState } from "react";
import { Arrow } from "./Hero";

/** Every link in the closing room points at the studio's one public profile. */
const SOCIAL_URL = "https://www.instagram.com/ah.uiux/";

/** The social row that replaced the site's own navigation. */
const SOCIALS = [
  { label: "Instagram" },
  { label: "Behance" },
  { label: "Dribbble" },
  { label: "LinkedIn" },
];

/** The small print, kept as a row but pointed at the same profile. */
const LEGAL = ["PRIVACY", "TERMS", "COOKIES"];

/**
 * The closing room. The same wall the story ends on, with the brand, a way to
 * keep in touch, and the site's own links.
 *
 * The sign-up is local only: there is no list behind it yet, so it confirms
 * the address and goes no further.
 */
export default function WarmFooter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <footer className="warm-footer">
      <div className="warm-footer-room" aria-hidden="true">
        <Image
          src="/assets/footer-background.png"
          alt=""
          fill
          sizes="100vw"
          quality={85}
        />
      </div>
      <div className="warm-footer-shade" aria-hidden="true" />

      <div className="warm-footer-top">
        <div className="warm-footer-brand">
          <a className="warm-footer-lockup" href="#home" aria-label="AERIS home">
            <Image
              className="warm-footer-mark"
              src="/assets/logo-mark.png"
              alt=""
              width={640}
              height={640}
              sizes="(max-width: 767px) 78px, 160px"
            />
            <span>AERIS</span>
          </a>
          <p className="warm-footer-line">A calmer world within.</p>
        </div>

        <form
          className="warm-footer-join"
          onSubmit={(event) => {
            event.preventDefault();
            if (email.trim()) setJoined(true);
          }}
        >
          <h2>Join our world</h2>
          <div className="warm-footer-field">
            <input
              type="email"
              required
              value={email}
              placeholder="Your email address"
              aria-label="Your email address"
              onChange={(event) => {
                setEmail(event.target.value);
                setJoined(false);
              }}
            />
            <button type="submit" aria-label="Join our world">
              <Arrow />
            </button>
          </div>
          <p className="warm-footer-note" role="status">
            {joined ? "Thank you. We will be in touch." : ""}
          </p>
        </form>
      </div>

      <nav className="warm-footer-nav" aria-label="Social">
        {SOCIALS.map((social) => (
          <a
            key={social.label}
            href={SOCIAL_URL}
            target="_blank"
            rel="noreferrer noopener"
          >
            {social.label}
          </a>
        ))}
      </nav>

      <div className="warm-footer-base">
        <small>
          © {new Date().getFullYear()} AHSTUDIO. ALL RIGHTS RESERVED.
        </small>
        <p className="warm-footer-legal">
          {LEGAL.map((label) => (
            <a
              key={label}
              href={SOCIAL_URL}
              target="_blank"
              rel="noreferrer noopener"
            >
              {label}
            </a>
          ))}
        </p>
      </div>
    </footer>
  );
}
