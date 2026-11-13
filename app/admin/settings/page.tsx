import { redirect } from "next/navigation";
import { BackLink } from "../../../components/back-link";
import { currentAdmin } from "../../../src/auth";
import { prisma } from "../../../src/db";
import { saveSettings } from "../actions";

export default async function SettingsPage() {
  if (!(await currentAdmin())) redirect("/admin/login");
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  if (!setting) redirect("/admin");
  const identityReady = Boolean(setting.legalName && setting.email && setting.address);
  return (
    <main className="wrap admin">
      <BackLink href="/admin">Pedidos</BackLink>
      <h1>Configurações</h1>
      <ol>
        <li>Nome, e-mail e endereço reais publicados. {identityReady ? "Preenchido." : "Ainda falta."}</li>
        <li>Uma cobrança real em dólar, com Visa ou Mastercard de fora do Brasil, caiu em real.</li>
        <li>Cada produto ativo tem estoque nos EUA, cotação e sobra de pelo menos US$ 8 dentro da faixa.</li>
        <li>Um pedido de teste foi enviado à CJ sem cobrar o cliente.</li>
        <li>O saldo em dólar na CJ cobre três envios do produto ativo mais caro, recarregado antes da primeira venda.</li>
      </ol>
      <p>O programa só impede o checkout público sem nome, e-mail e endereço. Os outros quatro portões são conferência sua.</p>
      <form className="form" action={saveSettings}>
        <label>Nome legal<input name="legalName" defaultValue={setting.legalName} /></label>
        <label>E-mail<input name="email" type="email" defaultValue={setting.email} /></label>
        <label>Endereço<textarea name="address" defaultValue={setting.address} /></label>
        <label>Frase da vitrine<input name="tagline" defaultValue={setting.tagline} /></label>
        <label>Saldo CJ, em centavos<input name="cjBalanceCents" type="number" defaultValue={setting.cjBalanceCents} /></label>
        <label>
          <input type="checkbox" name="checkoutPublic" defaultChecked={setting.checkoutPublic} disabled={!identityReady && !setting.checkoutPublic} />
          Checkout público
        </label>
        <button type="submit">Salvar</button>
      </form>
    </main>
  );
}
