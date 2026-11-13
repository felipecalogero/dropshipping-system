"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BackLink } from "../../components/back-link";

type Line = { productId: string; quantity: number; name?: string; price?: string; image?: string; imageAlt?: string };

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem("cart");
    const cart = raw ? (JSON.parse(raw) as Line[]) : [];
    if (cart.length === 0) {
      setLines([]);
      setReady(true);
      return;
    }
    const ids = cart.map((line) => line.productId).join(",");
    fetch(`/api/catalog?ids=${ids}`)
      .then((response) => response.json())
      .then((products: { id: string; name: string; price: string; image?: string; imageAlt?: string }[]) => {
        setLines(cart.map((line) => {
          const product = products.find((item) => item.id === line.productId);
          return { ...line, name: product?.name, price: product?.price, image: product?.image, imageAlt: product?.imageAlt };
        }));
      })
      .catch(() => setLines(cart))
      .finally(() => setReady(true));
  }, []);

  function save(next: Line[]) {
    window.localStorage.setItem("cart", JSON.stringify(next.map(({ productId, quantity }) => ({ productId, quantity }))));
    setLines(next);
  }

  return (
    <main className="wrap plain">
      <BackLink href="/">Back to shop</BackLink>
      <h1>Cart</h1>
      {!ready ? <p className="muted">Loading your cart.</p> : null}
      {ready && lines.length === 0 ? (
        <div className="empty">
          <p>Your cart is empty.</p>
          <Link className="button" href="/">Continue shopping</Link>
        </div>
      ) : null}
      {lines.map((line) => (
        <article key={line.productId} className="line">
          <div className="line-photo">
            {line.image ? <img src={line.image} alt={line.imageAlt || ""} /> : null}
          </div>
          <div className="line-copy">
            <h2>{line.name || "Unavailable item"}</h2>
            <p className="price">{line.price}</p>
          </div>
          <div className="line-controls">
            <label>
              Quantity
              <input
                className="qty"
                type="number"
                min={1}
                max={10}
                value={line.quantity}
                onChange={(event) => {
                  const quantity = Math.min(10, Math.max(1, Number(event.target.value) || 1));
                  save(lines.map((item) => item.productId === line.productId ? { ...item, quantity } : item));
                }}
              />
            </label>
            <button type="button" className="quiet" onClick={() => save(lines.filter((item) => item.productId !== line.productId))}>
              Remove
            </button>
          </div>
        </article>
      ))}
      {lines.length > 0 ? <div className="cart-actions"><Link className="button" href="/checkout">Checkout</Link></div> : null}
    </main>
  );
}
