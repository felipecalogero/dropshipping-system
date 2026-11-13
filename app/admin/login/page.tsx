import { BackLink } from "../../../components/back-link";
import { login } from "../actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const { erro } = await searchParams;
  return (
    <main className="wrap plain">
      <BackLink href="/">Loja</BackLink>
      <h1>Entrar</h1>
      {erro ? <p className="notice">E-mail ou senha não conferem.</p> : null}
      <form className="form" action={login}>
        <label>E-mail<input name="email" type="email" autoComplete="username" required /></label>
        <label>Senha<input name="password" type="password" autoComplete="current-password" required /></label>
        <button type="submit">Entrar</button>
      </form>
    </main>
  );
}
