"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { placeOrder } from "./actions";

const notices: Record<string, string> = {
  closed: "The shop is not charging cards yet. No order was created.",
  no_quote: "Shipping could not be quoted, so checkout did not open payment.",
  bad_state: "This shop ships only to the 50 states and Washington, DC.",
  below_margin: "This order cannot be placed at the current price.",
  out_of_band: "This order is outside the price range the shop will sell.",
  missing: "An item in the cart is no longer available.",
  payment_not_connected: "Payment is not connected yet, so no order was created.",
};

export function CheckoutForm({
  checkoutPublic,
  states,
  notice,
}: {
  checkoutPublic: boolean;
  states: string[];
  notice?: string;
}) {
  const [cart, setCart] = useState("[]");
  const [empty, setEmpty] = useState(false);
  useEffect(() => {
    const raw = window.localStorage.getItem("cart") || "[]";
    setCart(raw);
    try {
      setEmpty((JSON.parse(raw) as unknown[]).length === 0);
    } catch {
      setEmpty(true);
    }
  }, []);

  if (!checkoutPublic) {
    return <p className="notice">The shop is not charging cards yet. You can keep browsing. No order is created.</p>;
  }

  if (empty) {
    return (
      <div className="empty">
        <p>Your cart is empty, so there is nothing to pay.</p>
        <Link className="button" href="/">Continue shopping</Link>
      </div>
    );
  }

  return (
    <form className="form" action={placeOrder}>
      {notice && notices[notice] ? <p className="notice">{notices[notice]}</p> : null}
      <input type="hidden" name="cart" value={cart} />
      <label>Full name<input name="name" autoComplete="name" required /></label>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Phone<input name="phone" type="tel" autoComplete="tel" required /></label>
      <label>Address<input name="line1" autoComplete="address-line1" required /></label>
      <label>Apartment, optional<input name="line2" autoComplete="address-line2" /></label>
      <label>City<input name="city" autoComplete="address-level2" required /></label>
      <label>
        State
        <select name="stateCode" autoComplete="address-level1" required defaultValue="CA">
          {states.map((state) => <option key={state}>{state}</option>)}
        </select>
      </label>
      <label>ZIP code<input name="postalCode" autoComplete="postal-code" required /></label>
      <button type="submit">Pay</button>
    </form>
  );
}
