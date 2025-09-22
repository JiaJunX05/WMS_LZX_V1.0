@extends("layouts.app")

@section("title", "Staff Panel")
@section("content")

<div class="container text-center mt-5">
    <!-- Success Alert -->
    @if(session('success'))
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            {{ session('success') }}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    @endif

    {{-- <div class="container">
        <div class="row g-3">
            <div class="col-sm-12 col-md-6 col-lg-4">
                <a href="{{ route('users') }}" class="text-decoration-none">
                    <div class="card shadow-sm border-0 w-100">
                        <div class="card-header bg-light d-flex flex-column align-items-start p-3" style="border-bottom: 2px solid #007bff;">
                            <h5 class="card-title mb-1" style="font-weight: bold; color: #333; font-size: 1.2rem;">
                                <i class="bi bi-person-fill me-3"></i>Staff List
                            </h5>
                        </div>
                        <div class="position-relative text-center d-flex align-items-center justify-content-around mb-3">
                            <div class="d-flex flex-column align-items-center mt-3">
                                <div class="card shadow-sm p-3 mb-2 border-0" style="width: 150px;">
                                    <div id="total-progress" style="width: 120px; height: 120px;"></div>
                                    <div id="total-count" class="mt-2 text-secondary fw-bold">
                                        Total Users : <span id="count">{{ $totalCount }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="ms-4 d-flex flex-column align-items-center gap-3">
                                <div class="card shadow-sm p-2 border-0 text-center" style="width: 160px;">
                                    <p class="fw-bold text-danger mb-1">Total Admin</p>
                                    <h5 class="fw-bold text-danger mb-1"><span id="admin-count">{{ $adminCount }}</span></h5>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar bg-danger" role="progressbar" id="admin-progress"></div>
                                    </div>
                                </div>
                                <div class="card shadow-sm p-2 border-0 text-center" style="width: 160px;">
                                    <p class="fw-bold text-primary mb-1">Total Staff</p>
                                    <h5 class="fw-bold text-primary mb-1"><span id="staff-count">{{ $staffCount }}</span></h5>
                                    <div class="progress" style="height: 6px;">
                                        <div class="progress-bar bg-primary" role="progressbar" id="staff-progress"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    </div> --}}
</div>

{{-- <script>
// 获取用户数据
var totalUsers = {{ $totalCount }};
var adminUsers = {{ $adminCount }};
var staffUsers = {{ $staffCount }};

// 更新进度条宽度
document.getElementById("admin-progress").style.width = (adminUsers / totalUsers * 100) + "%";
document.getElementById("staff-progress").style.width = (staffUsers / totalUsers * 100) + "%";

// 初始化圆形进度条
var bar = new ProgressBar.Circle("#total-progress", {
    strokeWidth: 6,       // 线条宽度
    easing: "easeInOut",  // 动画缓动效果
    duration: 1500,       // 动画时间
    color: "#007bff",     // 进度条颜色
    trailColor: "#eee",   // 背景轨道颜色
    trailWidth: 6,        // 背景轨道宽度
    text: {               // 显示文本
        value: "0",
        className: "progress-text",
        style: {
            color: "#007bff",
            fontSize: "1.2rem",
            fontWeight: "bold",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)"
        }
    }
});

// 更新用户数量和进度条
function updateUserCount() {
    $.get("{{ route('admin.user.count') }}", function(data) {
        let newValue = data.count;

        // 更新总用户数
        $("#count").text(newValue);

        // 计算新进度
        let progressValue = newValue / 100; // 假设 100 是最大用户数
        bar.animate(progressValue, { duration: 1500 });

        // 更新圆圈内的数字
        bar.setText(newValue);
    });
}

// 初始加载
updateUserCount();

// 每 5 秒自动更新用户数据
setInterval(updateUserCount, 5000);
</script> --}}
@endsection
