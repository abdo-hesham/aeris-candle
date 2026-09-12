"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import ChapterLabel from "./ChapterLabel";
import BrandMark from "../Hero/BrandMark";
import Checkout from "./Checkout";
import { product } from "@/data/product";

export default function Purchase() {
  const [quantity, setQuantity] = useState(1);
  const [checkout, setCheckout] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem("aeris-cart"));
      if (Number.isInteger(saved) && saved >= 1 && saved <= 9)
        setQuantity(saved);
    } catch {
      /* Checkout also works with browser storage disabled. */
    }
  }, []);
  const addToBag = () => {
    try {
      localStorage.setItem("aeris-cart", String(quantity));
    } catch {
      /* In-memory cart is sufficient for checkout. */
    }
    setCheckout(true);
  };
  const faq = [
    {
      title: "What does it smell like?",
      answer:
        "A walk through the woods: green leaves, woodland moss and soft cedar. Fresh at first, earthy at the heart, and quietly warm as it settles.",
    },
    {
      title: "What is inside?",
      answer:
        "Aeris is a Large candle made with natural wax, with a stated burn time of 120 hours. Each candle is $45.",
    },
    {
      title: "How does ordering work?",
      answer:
        "You can try the full checkout here: add a candle, enter delivery details, review your order and receive a local confirmation. This is a local preview, so no payment, shipment or email is triggered.",
    },
    {
      title: "How should I care for my candle?",
      answer:
        "Follow the care instructions supplied with your candle. Place it on a stable, heat-resistant surface, away from drafts and flammable items. Never leave a burning candle unattended. Keep out of reach of children and pets.",
    },
  ];
  return (
    <section
      id="shop"
      className="purchase"
      aria-labelledby="purchase-title"
      data-chapter="6"
    >
      <div className="purchase-main">
        <div className="purchase-portrait">
          <span className="small-label">AERIS / SCENT NO. 01</span>
          <Image
            src="/assets/candle-product.png"
            alt="Aeris Large natural wax candle"
            width={800}
            height={800}
            sizes="(max-width: 640px) 90vw, 45vw"
            quality={90}
          />
          <span className="portrait-caption">A quieter kind of luxury.</span>
        </div>
        <div className="purchase-copy">
          <ChapterLabel number="06">BRING IT HOME</ChapterLabel>
          <h2 id="purchase-title" className="display-heading">
            Aeris.
            <br />
            <em>Your quiet ritual.</em>
          </h2>
          <p className="body-copy">
            A little of the outside, brought in. Natural wax, a warm light, and
            room for a slower moment.
          </p>
          <p className="purchase-notes">LARGE · NATURAL WAX · 120-HOUR BURN</p>
          <p className="product-price">
            $45 <span>USD / EACH</span>
          </p>
          <div className="purchase-actions">
            <div
              className="quantity-control"
              role="group"
              aria-label="Choose quantity"
            >
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity === 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <output aria-label="Quantity">{quantity}</output>
              <button
                onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                disabled={quantity === 9}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            {product.checkoutUrl ? (
              <a className="primary-button" href={product.checkoutUrl}>
                SHOP THE CANDLE <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <button className="primary-button" onClick={addToBag}>
                ADD TO BAG <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
          <p className="purchase-status">
            Local checkout available. No payment is collected.
          </p>
          <div className="faq">
            {faq.map((item, i) => (
              <div className="faq-item" key={item.title}>
                <h3>
                  <button
                    aria-expanded={open === i}
                    aria-controls={`faq-answer-${i}`}
                    onClick={() => setOpen(open === i ? null : i)}
                  >
                    {item.title}
                    <span aria-hidden="true">{open === i ? "−" : "+"}</span>
                  </button>
                </h3>
                <div
                  id={`faq-answer-${i}`}
                  className={`faq-answer ${open === i ? "is-open" : ""}`}
                  inert={open !== i}
                >
                  <div>
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <footer className="story-footer">
        <a className="footer-brand" href="#home" aria-label="AERIS back to top">
          <BrandMark />
          <span>AERIS</span>
        </a>
        <p>NATURE INSPIRES. SCENTS STAY.</p>
        <a href="#home" className="text-link">
          BACK TO THE FOREST <span aria-hidden="true">↑</span>
        </a>
      </footer>
      {checkout && <Checkout onClose={() => setCheckout(false)} />}
    </section>
  );
}
