"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { product } from "@/data/product";
import "@/app/checkout.css";

type Delivery = {
  name: string;
  email: string;
  address: string;
  city: string;
  country: string;
};
type Receipt = { id: string; quantity: number; total: number; date: string };
const money = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(amount);

export default function Checkout({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<"bag" | "delivery" | "review" | "complete">(
    "bag",
  );
  const [quantity, setQuantity] = useState(1);
  const [delivery, setDelivery] = useState<Delivery>({
    name: "",
    email: "",
    address: "",
    city: "",
    country: "",
  });
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [storageNotice, setStorageNotice] = useState("");
  const submitted = useRef(false);
  const total = quantity * product.price;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const currentDialog = dialog.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      currentDialog?.close();
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus();
  }, [step]);
  const placeOrder = () => {
    if (submitted.current) return;
    submitted.current = true;
    const order = {
      id: `AER-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      quantity,
      total,
      date: new Date().toISOString(),
    };
    try {
      localStorage.setItem("aeris-last-order", JSON.stringify(order));
      localStorage.removeItem("aeris-cart");
    } catch {
      setStorageNotice(
        "Browser storage is unavailable. Keep this order reference before closing.",
      );
    }
    setReceipt(order);
    setStep("complete");
  };
  return (
    <dialog
      ref={dialog}
      className="checkout-dialog"
      data-lenis-prevent
      aria-labelledby="checkout-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="checkout-inner" data-lenis-prevent>
        <button
          className="checkout-close"
          onClick={onClose}
          aria-label="Close checkout"
        >
          CLOSE <span aria-hidden="true">×</span>
        </button>
        <p className="small-label">AERIS / YOUR QUIET MOMENT</p>
        <p className="checkout-mode">
          Local checkout. No payment is taken and no order is sent.
        </p>
        <ol className="checkout-steps" aria-label="Checkout progress">
          {["bag", "delivery", "review"].map((name, i) => (
            <li key={name} aria-current={step === name ? "step" : undefined}>
              <span>0{i + 1}</span>
              {name}
            </li>
          ))}
        </ol>
        <h2 id="checkout-title" data-step-heading tabIndex={-1}>
          {step === "bag"
            ? "Your bag."
            : step === "delivery"
              ? "Where it belongs."
              : step === "review"
                ? "One last look."
                : "Your ritual awaits."}
        </h2>
        {step !== "complete" && (
          <div className="checkout-product">
            <Image
              src="/assets/warm-candle.png"
              alt="Aeris Large candle"
              width={150}
              height={150}
            />
            <div>
              <h3>{product.name}</h3>
              <p>Large · Natural wax</p>
              <p>
                {quantity} × {money(product.price)}
              </p>
            </div>
            <strong>{money(total)}</strong>
          </div>
        )}
        {step === "bag" && (
          <>
            <p className="body-copy">
              Natural wax. A 120-hour burn. A little room for stillness.
            </p>
            <div className="checkout-quantity">
              <span>Quantity</span>
              <div
                className="checkout-quantity-control"
                role="group"
                aria-label="Quantity"
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity === 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <output aria-live="polite">{quantity}</output>
                <button
                  onClick={() => setQuantity((q) => Math.min(9, q + 1))}
                  disabled={quantity === 9}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <button
              className="primary-button"
              onClick={() => setStep("delivery")}
            >
              CONTINUE TO DELIVERY <span aria-hidden="true">→</span>
            </button>
            <button className="checkout-back" onClick={onClose}>
              Continue exploring
            </button>
          </>
        )}
        {step === "delivery" && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (event.currentTarget.reportValidity()) setStep("review");
            }}
          >
            <div className="delivery-fields">
              {(
                [
                  { key: "name", label: "Full name", autoComplete: "name" },
                  { key: "email", label: "Email", autoComplete: "email" },
                  {
                    key: "address",
                    label: "Street address",
                    autoComplete: "street-address",
                  },
                  {
                    key: "city",
                    label: "City",
                    autoComplete: "address-level2",
                  },
                  {
                    key: "country",
                    label: "Country",
                    autoComplete: "country-name",
                  },
                ] as const
              ).map((field) => (
                <label key={field.key}>
                  {field.label}
                  <input
                    required
                    minLength={field.key === "email" ? undefined : 2}
                    maxLength={field.key === "address" ? 200 : 100}
                    name={field.key}
                    autoComplete={field.autoComplete}
                    type={field.key === "email" ? "email" : "text"}
                    value={delivery[field.key]}
                    onChange={(event) =>
                      setDelivery({
                        ...delivery,
                        [field.key]: event.target.value,
                      })
                    }
                    onBlur={(event) =>
                      setDelivery((current) => ({
                        ...current,
                        [field.key]: event.target.value.trim(),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <p className="checkout-privacy">
              Delivery details stay in this session. Nothing is transmitted.
            </p>
            <button className="primary-button" type="submit">
              REVIEW ORDER <span aria-hidden="true">→</span>
            </button>
            <button
              className="checkout-back"
              type="button"
              onClick={() => setStep("bag")}
            >
              Back to bag
            </button>
          </form>
        )}
        {step === "review" && (
          <>
            <div className="delivery-review">
              <span className="small-label">DELIVERY DETAILS</span>
              <p>
                {delivery.name}
                <br />
                {delivery.address}
                <br />
                {delivery.city}, {delivery.country}
                <br />
                {delivery.email}
              </p>
              <button className="text-link" onClick={() => setStep("delivery")}>
                EDIT DETAILS
              </button>
            </div>
            <dl className="order-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{money(total)}</dd>
              </div>
              <div>
                <dt>Demo shipping</dt>
                <dd>{money(0)}</dd>
              </div>
              <div>
                <dt>Demo total</dt>
                <dd>{money(total)}</dd>
              </div>
            </dl>
            <p className="checkout-privacy">
              This creates a local demonstration order only. No charge, shipment
              or confirmation email.
            </p>
            <button className="primary-button" onClick={placeOrder}>
              PLACE LOCAL ORDER <span aria-hidden="true">↗</span>
            </button>
          </>
        )}
        {step === "complete" && receipt && (
          <div className="order-confirmation">
            <span className="confirmation-mark" aria-hidden="true">
              ✓
            </span>
            <p className="body-copy">
              Thank you, {delivery.name.split(" ")[0]}. Your local order is
              complete.
            </p>
            <dl className="order-totals">
              <div>
                <dt>Order reference</dt>
                <dd>{receipt.id}</dd>
              </div>
              <div>
                <dt>Aeris · Large</dt>
                <dd>× {receipt.quantity}</dd>
              </div>
              <div>
                <dt>Demo total</dt>
                <dd>{money(receipt.total)}</dd>
              </div>
              <div>
                <dt>Amount charged</dt>
                <dd>{money(0)}</dd>
              </div>
            </dl>
            <p className="checkout-privacy">
              Saved on this browser only. No payment was taken and no order was
              submitted for fulfilment. {storageNotice}
            </p>
            <button className="primary-button" onClick={onClose}>
              BACK TO THE COLLECTION <span aria-hidden="true">↗</span>
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
