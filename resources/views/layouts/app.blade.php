<!-- filepath: resources\views\layouts\app.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="description" content="Warehouse Management System">
    <meta name="author" content="Warehouse Management System">
    <title>WMS_LZX_V1.0 || @yield("title")</title>

    <!-- ==================== CSS Section ==================== -->
    <!-- Bootstrap 5.3.3 Core CSS -->
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
          crossorigin="anonymous">

    <!-- Bootstrap Icons 1.11.3 -->
    <link rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="{{ asset('assets/css/layouts/variables.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/layouts/sidebar.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/layouts/header.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/css/layouts/footer.css') }}">
    @yield("css")
</head>

<body class="bg-light">
    <!-- ==================== Layout Wrapper ==================== -->
    <div class="layout-wrapper d-flex">
        <!-- Sidebar -->
        @include('layouts.sidebar')

        <!-- Main Content -->
        <div class="main-content d-flex flex-column flex-grow-1">
            <!-- Header -->
            <header class="sticky-top">
                @include('layouts.header')
            </header>

            <!-- Content Area -->
            <main class="content flex-grow-1 p-4">
                @yield("content")
            </main>

            <!-- Footer -->
            <footer class="mt-auto">
                @include('layouts.footer')
            </footer>
        </div>
    </div>

    <!-- ==================== Scripts ==================== -->
    <!-- jQuery -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
            integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
            crossorigin="anonymous"></script>

    <!-- Bootstrap Bundle -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
            crossorigin="anonymous"></script>

    <!-- 全局 Alert 管理系统 -->
    <script src="{{ asset('assets/js/components/alert-management.js') }}"></script>

    <!-- Custom Page Scripts -->
    @yield("scripts")
</body>
</html>
