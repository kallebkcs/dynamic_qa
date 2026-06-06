<template>
  <header>
    <h1>Dynamic QA</h1>
  </header>

  <router-view />

  <footer>
    <p>© 2026 - UFSC Ara</p>
  </footer>
</template>

<style>
header,
footer {
  width: 100%;
  text-align: center;
}

header {
  padding: 24px 0 12px;
  background: rgba(79, 70, 229, 0.08);
}

header h1 {
  margin: 0;
  font-size: 1.8rem;
  letter-spacing: 0.05em;
  color: #3730a3;
}

footer {
  padding: 14px 0;
  background: rgba(243, 244, 255, 0.92);
  color: #4b5563;
}

footer p {
  margin: 0;
  font-size: 0.95rem;
}
</style>