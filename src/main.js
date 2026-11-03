import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

const page = document.body.dataset.page || 'Home'

document.querySelector('#app').innerHTML = `
  <main class="container py-5">
    <div class="text-center">
      <i class="bi bi-paw display-4 text-primary" aria-hidden="true"></i>
      <h1 class="mt-3">Pawly</h1>
      <h2 class="h4 text-secondary">${page}</h2>
      <p class="text-secondary mb-0">This page is ready for future development.</p>
    </div>
  </main>
`
