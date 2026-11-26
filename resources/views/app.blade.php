<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="/favicon.ico?v=unexo_v4">
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=unexo_v4">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=unexo_v4">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=unexo_v4">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=unexo_v4">
    <title inertia>{{ config('app.name', 'CRM EDUCATIVO') }}</title>

    <!-- Google Fonts Multi-Tema: Lora (Adultos), Plus Jakarta Sans (Jóvenes), Quicksand & Nunito (Niños) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Nunito:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Quicksand:wght@500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased text-[#4c5a73] bg-[#f5f9fd]">
    @inertia
</body>
</html>
