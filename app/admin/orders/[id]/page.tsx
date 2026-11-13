import { notFound, redirect } from "next/navigation";
import { BackLink } from "../../../../components/back-link";
import { currentAdmin } from "../../../../src/auth";
import { prisma } from "../../../../src/db";
import { cancelOrder, recordRefund, sendToCj, syncTracking } from "../../actions";

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await currentAdmin())) redirect("/admin/login");
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();
  return (
    <main className="wrap admin">
      <BackLink href="/admin">Pedidos</BackLink>
      <h1>{order.name}</h1>
      <div className="meta">
        <p>Status interno: {order.internalStatus}</p>
        <p>Telefone: {order.phone}</p>
        <p>{order.line1}, {order.city}, {order.stateCode} {order.postalCode}</p>
        <p>Nota interna: {order.internalNote || "—"}</p>
        <p className="muted">Custo fornecedor por item fica só aqui.</p>
      </div>
      <ul className="admin-list">
        {order.items.map((item) => (
          <li key={item.id}>{item.quantity} × {item.name} — custo {item.supplierCostCents} centavos</li>
        ))}
      </ul>
      {order.internalStatus === "paid" || order.internalStatus === "awaiting_payment" ? (
        <div className="actions">
          {order.internalStatus === "paid" ? (
            <form action={sendToCj}><input type="hidden" name="id" value={order.id} /><button type="submit">Enviar à CJ</button></form>
          ) : (
            <form action={cancelOrder}><input type="hidden" name="id" value={order.id} /><button className="quiet" type="submit">Cancelar</button></form>
          )}
        </div>
      ) : null}
      <form className="form" action={syncTracking}>
        <input type="hidden" name="id" value={order.id} />
        <label>Transportadora<input name="carrier" defaultValue={order.carrier || ""} /></label>
        <label>Código de rastreio<input name="trackingCode" defaultValue={order.trackingCode || ""} /></label>
        <button type="submit">Registrar envio</button>
      </form>
      <form action={recordRefund}>
        <input type="hidden" name="id" value={order.id} />
        <button className="quiet" type="submit">Registrar reembolso já feito no Stripe</button>
      </form>
    </main>
  );
}
