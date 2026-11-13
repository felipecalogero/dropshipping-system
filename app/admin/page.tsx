import Link from "next/link";
import { redirect } from "next/navigation";
import { currentAdmin } from "../../src/auth";
import { logout } from "./actions";
import { prisma } from "../../src/db";

export default async function AdminHome() {
  if (!(await currentAdmin())) redirect("/admin/login");
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <main className="wrap admin">
      <div className="bar">
        <h1>Pedidos</h1>
        <form action={logout}><button className="quiet" type="submit">Sair</button></form>
      </div>
      <nav className="nav">
        <Link href="/admin/products">Produtos</Link>
        <Link href="/admin/settings">Configurações</Link>
      </nav>
      <div className="table-wrap">
      <table>
        <thead><tr><th>Cliente</th><th>Status interno</th><th>Total</th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><Link href={`/admin/orders/${order.id}`}>{order.name}</Link></td>
              <td>{order.internalStatus}</td>
              <td>{(order.totalCents / 100).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </main>
  );
}
