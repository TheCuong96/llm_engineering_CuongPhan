#include <iostream>
#include <chrono>

double calculate(int iterations, int param1, int param2) {
    double result = 1.0;
    for (int i = 1; i <= iterations; ++i) {
        int j = i * param1 - param2;
        result -= 1.0 / j;
        j = i * param1 + param2;
        result += 1.0 / j;
    }
    return result * 4;
}

int main() {
    auto start_time = std::chrono::high_resolution_clock::now();
    double result = calculate(200000000, 4, 1);
    auto end_time = std::chrono::high_resolution_clock::now();

    std::cout.precision(12);
    std::cout << "Kết quả (Result): " << result << std::endl;
    std::cout << "Thời gian thực thi (Execution Time): "
              << std::chrono::duration<double>(end_time - start_time).count()
              << " giây" << std::endl;

    return 0;
}