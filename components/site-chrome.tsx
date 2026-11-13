"use client";

import Link from "next/link";

export function SiteHeader({ name }: { name: string }) {
  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link className="brand" href="/" aria-label={name}>
          <img src="/logo-curlden.png" alt={name} />
        </Link>
        <nav className="nav">
          <Link href="/cart">Cart</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ name, address }: { name: string; address: string }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <strong>{name}</strong>
        <p>{address || "Address will appear here before the shop opens for payment."}</p>
        <nav className="nav">
          <Link href="/shipping">Shipping</Link>
          <Link href="/returns">Returns</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/legal">Legal</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}
