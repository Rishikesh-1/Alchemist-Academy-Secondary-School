<?php
// Apache (XAMPP) serves this before index.html. The root index.html is Vite's
// source entry, so send visitors to the production build instead.
header('Location: dist/');
exit;
