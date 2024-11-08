export const SAMPLES = {
  javascript: {
    label: "Two Sum (Hash Map)",
    code: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return [];
}`,
  },

  typescript: {
    label: "Merge Sort",
    code: `function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;

  const mid   = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                     result.push(right[j++]);
  }

  return [...result, ...left.slice(i), ...right.slice(j)];
}`,
  },

  python: {
    label: "Bubble Sort",
    code: `def bubble_sort(arr):
    n = len(arr)

    for i in range(n):
        swapped = False

        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True

        if not swapped:
            break

    return arr`,
  },

  java: {
    label: "Binary Search",
    code: `public int binarySearch(int[] nums, int target) {
    int left  = 0;
    int right = nums.length - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;

        if      (nums[mid] == target) return mid;
        else if (nums[mid] <  target) left  = mid + 1;
        else                          right = mid - 1;
    }

    return -1;
}`,
  },

  cpp: {
    label: "Fibonacci (Recursive)",
    code: `int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`,
  },

  go: {
    label: "Linear Search",
    code: `func linearSearch(nums []int, target int) int {
    for i, v := range nums {
        if v == target {
            return i
        }
    }
    return -1
}`,
  },

  rust: {
    label: "Factorial (Recursive)",
    code: `fn factorial(n: u64) -> u64 {
    if n == 0 {
        return 1;
    }
    n * factorial(n - 1)
}`,
  },
};

export const LANGUAGES = [
  { value: "javascript", label: "JavaScript", ext: "js" },
  { value: "python",     label: "Python",     ext: "py" },
  { value: "java",       label: "Java",       ext: "java" },
  { value: "cpp",        label: "C++",        ext: "cpp" },
  { value: "typescript", label: "TypeScript", ext: "ts" },
  { value: "go",         label: "Go",         ext: "go" },
  { value: "rust",       label: "Rust",       ext: "rs" },
];

export const RATING_CONFIG = {
  excellent: { color: "badge-green",  bar: "bg-cyan-400",   score: 95, label: "Excellent" },
  good:      { color: "badge-green",  bar: "bg-cyan-400",   score: 75, label: "Good"      },
  fair:      { color: "badge-yellow", bar: "bg-yellow-400", score: 55, label: "Fair"      },
  poor:      { color: "badge-red",    bar: "bg-red-400",    score: 30, label: "Poor"      },
  critical:  { color: "badge-red",    bar: "bg-red-600",    score: 10, label: "Critical"  },
};
