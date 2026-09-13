#include <cstdio>
#include <chrono>

static double calculate(int iterations, int param1, int param2) {
#if defined(__clang__)
#pragma clang loop vectorize(disable)
#pragma clang loop interleave(disable)
#pragma clang fp reassociate(off)
#endif
    volatile double result = 1.0; // Giữ đúng thứ tự phép cộng/trừ như Python
    for (int i = 1; i <= iterations; ++i) {
        int base = i * param1;
        result -= 1.0 / static_cast<double>(base - param2);
        result += 1.0 / static_cast<double>(base + param2);
    }
    return result;
}

int main() {
    using clock = std::chrono::high_resolution_clock;
    auto start_time = clock::now();

    double result = calculate(200000000, 4, 1) * 4.0;

    auto end_time = clock::now();
    double elapsed = std::chrono::duration<double>(end_time - start_time).count();

    std::printf("Kết quả (Result): %.12f\n", result);
    std::printf("Thời gian thực thi (Execution Time): %.6f giây\n", elapsed);
    return 0;
}