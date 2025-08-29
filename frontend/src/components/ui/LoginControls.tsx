export default function LoginControls() {
  return (
    <>
      <a
        href="/auth/login?screen_hint=signup"
        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
      >
        Sign up
      </a>
      <a
        href="/auth/login"
        className="px-3 py-1 rounded-lg bg-green-600 hover:bg-blue-700 transition"
      >
        Log in
      </a>
    </>
  );
}
