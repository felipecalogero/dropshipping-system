"use client";

import Link from "next/link";
import { useState } from "react";

export function BuyBox({
  productId,
  price,
  checkoutPublic,
}: {
  productId: string;
  price: string;
  checkoutPublic: boolean;
}) {
  const [added, setAdded] = useState(false);

  function add() {
    const raw = window.localStorage.getItem("cart");
    const cart = raw ? (JSON.parse(raw) as { productId: string; quantity: number }[]) : [];
    const found = cart.find((item) => item.productId === productId);
    if (found) found.quantity = Math.min(10, found.quantity + 1);
    else cart.push({ productId, quantity: 1 });
    window.localStorage.setItem("cart", JSON.stringify(cart));
    setAdded(true);
  }

  return (
    <>
      <div className="buy">
        <button type="button" onClick={add}>Add to cart</button>
        {checkoutPublic ? null : (
          <p className="muted">The shop is not charging cards yet. You can look around, and checkout stays closed.</p>
        )}
      </div>
      <div className="sticky-buy">
        <strong>{price}</strong>
        <button type="button" onClick={add}>Add to cart</button>
      </div>
      {added ? (
        <div className="toast" role="status">
          <p>Added to cart</p>
          <Link href="/cart">View cart</Link>
          <button type="button" className="toast-close" onClick={() => setAdded(false)} aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ) : null}
    </>
  );
}
