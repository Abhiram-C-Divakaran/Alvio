import type { ProblemTestCase } from '../submissionRunner';

/**
 * Phase 7 curated server-only hidden test cases for Easy problems (123 problems, 544 cases).
 * Every expected value is independently verified against tests/oracles/easy.ts.
 */
export const PHASE7_EASY_HIDDEN_TESTS: Readonly<Record<string, readonly ProblemTestCase[]>> = {
  "sort-array-by-parity": [
    {
      "input": [
        [
          0
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        [
          2,
          4,
          6
        ]
      ],
      "expected": [
        2,
        4,
        6
      ]
    },
    {
      "input": [
        [
          1,
          3,
          5
        ]
      ],
      "expected": [
        1,
        3,
        5
      ]
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": [
        2,
        1
      ]
    }
  ],
  "binary-tree-postorder-traversal": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          42
        ]
      ],
      "expected": [
        42
      ]
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": [
        4,
        3,
        2,
        1
      ]
    },
    {
      "input": [
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": [
        3,
        2,
        1
      ]
    },
    {
      "input": [
        [
          4,
          2,
          6,
          1,
          3,
          5,
          7
        ]
      ],
      "expected": [
        1,
        3,
        2,
        5,
        7,
        6,
        4
      ]
    }
  ],
  "climbing-stairs-2": [
    {
      "input": [
        1
      ],
      "expected": 1
    },
    {
      "input": [
        4
      ],
      "expected": 5
    },
    {
      "input": [
        5
      ],
      "expected": 8
    },
    {
      "input": [
        10
      ],
      "expected": 89
    },
    {
      "input": [
        20
      ],
      "expected": 10946
    }
  ],
  "keyboard-row": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          "a",
          "Z",
          "m"
        ]
      ],
      "expected": [
        "a",
        "Z",
        "m"
      ]
    },
    {
      "input": [
        [
          "qwerty",
          "asdf",
          "zxcv",
          "ab"
        ]
      ],
      "expected": [
        "qwerty",
        "asdf",
        "zxcv"
      ]
    },
    {
      "input": [
        [
          "Dad",
          "Alaska",
          "Gas",
          "Top",
          "Tree"
        ]
      ],
      "expected": [
        "Dad",
        "Alaska",
        "Gas",
        "Top",
        "Tree"
      ]
    }
  ],
  "image-smoother": [
    {
      "input": [
        [
          [
            5
          ]
        ]
      ],
      "expected": [
        [
          5
        ]
      ]
    },
    {
      "input": [
        [
          [
            100,
            200,
            100
          ],
          [
            200,
            50,
            200
          ],
          [
            100,
            200,
            100
          ]
        ]
      ],
      "expected": [
        [
          137,
          141,
          137
        ],
        [
          141,
          138,
          141
        ],
        [
          137,
          141,
          137
        ]
      ]
    },
    {
      "input": [
        [
          [
            0,
            0
          ],
          [
            0,
            0
          ]
        ]
      ],
      "expected": [
        [
          0,
          0
        ],
        [
          0,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            10,
            20,
            30,
            40
          ]
        ]
      ],
      "expected": [
        [
          15,
          20,
          30,
          35
        ]
      ]
    }
  ],
  "invert-binary-tree": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          7
        ]
      ],
      "expected": [
        7
      ]
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": [
        1,
        null,
        2
      ]
    },
    {
      "input": [
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": [
        1,
        2,
        null,
        3
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          null,
          null,
          5
        ]
      ],
      "expected": [
        1,
        3,
        2,
        5,
        null,
        null,
        4
      ]
    }
  ],
  "relative-ranks": [
    {
      "input": [
        [
          10
        ]
      ],
      "expected": [
        "Gold Medal"
      ]
    },
    {
      "input": [
        [
          10,
          3,
          8,
          9,
          4
        ]
      ],
      "expected": [
        "Gold Medal",
        "5",
        "Bronze Medal",
        "Silver Medal",
        "4"
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3
        ]
      ],
      "expected": [
        "Bronze Medal",
        "Silver Medal",
        "Gold Medal"
      ]
    },
    {
      "input": [
        [
          100,
          50,
          75,
          25,
          0,
          99
        ]
      ],
      "expected": [
        "Gold Medal",
        "4",
        "Bronze Medal",
        "5",
        "6",
        "Silver Medal"
      ]
    }
  ],
  "license-key-formatting": [
    {
      "input": [
        "2-5g-3-J",
        2
      ],
      "expected": "2-5G-3J"
    },
    {
      "input": [
        "---",
        3
      ],
      "expected": ""
    },
    {
      "input": [
        "a-b-c-d",
        1
      ],
      "expected": "A-B-C-D"
    },
    {
      "input": [
        "2-4A0r7-4k",
        4
      ],
      "expected": "24A0-R74K"
    },
    {
      "input": [
        "abc",
        10
      ],
      "expected": "ABC"
    }
  ],
  "minimum-distance-between-bst-nodes": [
    {
      "input": [
        [
          1,
          0,
          48,
          null,
          null,
          12,
          49
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          10,
          5
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          90,
          69,
          null,
          49,
          89,
          null,
          52
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          27,
          null,
          34,
          null,
          58,
          50,
          null,
          44
        ]
      ],
      "expected": 6
    }
  ],
  "unique-morse-code-words": [
    {
      "input": [
        [
          "a"
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          "a",
          "a",
          "a"
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          "rwjje",
          "aittjje",
          "auyyn",
          "lqtktn",
          "lmjwn"
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          "cab",
          "abc",
          "cba",
          "aaa"
        ]
      ],
      "expected": 4
    }
  ],
  "intersection-of-two-arrays-easy": [
    {
      "input": [
        [],
        [
          1,
          2
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          1,
          3,
          5
        ],
        [
          2,
          4,
          6
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          7,
          7,
          7
        ],
        [
          7,
          8,
          9
        ]
      ],
      "expected": [
        7
      ]
    },
    {
      "input": [
        [
          -5,
          0,
          10
        ],
        [
          10,
          10,
          20
        ]
      ],
      "expected": [
        10
      ]
    }
  ],
  "merge-sorted-array": [
    {
      "input": [
        [
          1
        ],
        1,
        [],
        0
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        [
          0
        ],
        0,
        [
          1
        ],
        1
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        [
          4,
          5,
          6,
          0,
          0,
          0
        ],
        3,
        [
          1,
          2,
          3
        ],
        3
      ],
      "expected": [
        1,
        2,
        3,
        4,
        5,
        6
      ]
    },
    {
      "input": [
        [
          -5,
          -1,
          0,
          0,
          0
        ],
        2,
        [
          -3,
          0,
          4
        ],
        3
      ],
      "expected": [
        -5,
        -3,
        -1,
        0,
        4
      ]
    }
  ],
  "binary-tree-preorder-traversal": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          9
        ]
      ],
      "expected": [
        9
      ]
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": [
        1,
        2,
        3,
        4
      ]
    },
    {
      "input": [
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": [
        1,
        2,
        3
      ]
    },
    {
      "input": [
        [
          4,
          2,
          6,
          1,
          3,
          5,
          7
        ]
      ],
      "expected": [
        4,
        2,
        1,
        3,
        6,
        5,
        7
      ]
    }
  ],
  "sort-array-by-parity-ii": [
    {
      "input": [
        [
          2,
          1
        ]
      ],
      "expected": [
        2,
        1
      ]
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": [
        2,
        1
      ]
    },
    {
      "input": [
        [
          0,
          1,
          0,
          1
        ]
      ],
      "expected": [
        0,
        1,
        0,
        1
      ]
    },
    {
      "input": [
        [
          3,
          2,
          3,
          2
        ]
      ],
      "expected": [
        2,
        3,
        2,
        3
      ]
    },
    {
      "input": [
        [
          7,
          4,
          7,
          4
        ]
      ],
      "expected": [
        4,
        7,
        4,
        7
      ]
    }
  ],
  "image-smoother-easy": [
    {
      "input": [
        [
          [
            255
          ]
        ]
      ],
      "expected": [
        [
          255
        ]
      ]
    },
    {
      "input": [
        [
          [
            100,
            200,
            100
          ],
          [
            200,
            50,
            200
          ],
          [
            100,
            200,
            100
          ]
        ]
      ],
      "expected": [
        [
          137,
          141,
          137
        ],
        [
          141,
          138,
          141
        ],
        [
          137,
          141,
          137
        ]
      ]
    },
    {
      "input": [
        [
          [
            0,
            10
          ],
          [
            20,
            30
          ]
        ]
      ],
      "expected": [
        [
          15,
          15
        ],
        [
          15,
          15
        ]
      ]
    },
    {
      "input": [
        [
          [
            5
          ],
          [
            15
          ],
          [
            25
          ]
        ]
      ],
      "expected": [
        [
          10
        ],
        [
          15
        ],
        [
          20
        ]
      ]
    }
  ],
  "subtree-of-another-tree": [
    {
      "input": [
        [
          3,
          4,
          5,
          1,
          2,
          null,
          null,
          null,
          null,
          0
        ],
        [
          4,
          1,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          1
        ],
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ],
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        [
          2,
          4
        ]
      ],
      "expected": false
    }
  ],
  "search-in-a-binary-search-tree": [
    {
      "input": [
        [
          4,
          2,
          7,
          1,
          3
        ],
        5
      ],
      "expected": []
    },
    {
      "input": [
        [
          4,
          2,
          7,
          1,
          3
        ],
        4
      ],
      "expected": [
        4,
        2,
        7,
        1,
        3
      ]
    },
    {
      "input": [
        [
          4,
          2,
          7,
          1,
          3
        ],
        7
      ],
      "expected": [
        7
      ]
    },
    {
      "input": [
        [
          10,
          5,
          15,
          3,
          7,
          null,
          18
        ],
        15
      ],
      "expected": [
        15,
        null,
        18
      ]
    }
  ],
  "shift-2d-grid": [
    {
      "input": [
        [
          [
            1
          ]
        ],
        5
      ],
      "expected": [
        [
          1
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        4
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ]
    },
    {
      "input": [
        [
          [
            3,
            8,
            1,
            9
          ],
          [
            19,
            7,
            2,
            5
          ],
          [
            4,
            6,
            11,
            10
          ],
          [
            12,
            0,
            21,
            13
          ]
        ],
        4
      ],
      "expected": [
        [
          12,
          0,
          21,
          13
        ],
        [
          3,
          8,
          1,
          9
        ],
        [
          19,
          7,
          2,
          5
        ],
        [
          4,
          6,
          11,
          10
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2,
            3
          ]
        ],
        10
      ],
      "expected": [
        [
          3,
          1,
          2
        ]
      ]
    }
  ],
  "positions-of-large-groups": [
    {
      "input": [
        "abc"
      ],
      "expected": []
    },
    {
      "input": [
        "aaa"
      ],
      "expected": [
        [
          0,
          2
        ]
      ]
    },
    {
      "input": [
        "abcdddeeeeaabbbcd"
      ],
      "expected": [
        [
          3,
          5
        ],
        [
          6,
          9
        ],
        [
          12,
          14
        ]
      ]
    },
    {
      "input": [
        "aaabbbccc"
      ],
      "expected": [
        [
          0,
          2
        ],
        [
          3,
          5
        ],
        [
          6,
          8
        ]
      ]
    },
    {
      "input": [
        "a"
      ],
      "expected": []
    }
  ],
  "binary-tree-tilt": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          5
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          4,
          2,
          9,
          3,
          5,
          null,
          7
        ]
      ],
      "expected": 15
    },
    {
      "input": [
        [
          21,
          7,
          14,
          1,
          1,
          2,
          2,
          3,
          3
        ]
      ],
      "expected": 9
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": 20
    }
  ],
  "intersection-of-two-arrays": [
    {
      "input": [
        [],
        [
          1
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        [
          4,
          5,
          6
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          9,
          9,
          1
        ],
        [
          9,
          2,
          3
        ]
      ],
      "expected": [
        9
      ]
    },
    {
      "input": [
        [
          -10,
          0,
          5
        ],
        [
          5,
          5,
          5
        ]
      ],
      "expected": [
        5
      ]
    }
  ],
  "count-complete-tree-nodes": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          2,
          3
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7
        ]
      ],
      "expected": 7
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10
        ]
      ],
      "expected": 10
    }
  ],
  "out-of-boundary-paths-easy": [
    {
      "input": [
        1,
        3,
        3,
        0,
        1
      ],
      "expected": 12
    },
    {
      "input": [
        1,
        1,
        0,
        0,
        0
      ],
      "expected": 0
    },
    {
      "input": [
        1,
        1,
        1,
        0,
        0
      ],
      "expected": 4
    },
    {
      "input": [
        3,
        3,
        4,
        1,
        1
      ],
      "expected": 52
    },
    {
      "input": [
        8,
        5,
        10,
        3,
        2
      ],
      "expected": 79695
    }
  ],
  "minimum-absolute-difference": [
    {
      "input": [
        [
          1,
          3,
          6,
          10,
          15
        ]
      ],
      "expected": [
        [
          1,
          3
        ]
      ]
    },
    {
      "input": [
        [
          3,
          8,
          -10,
          23,
          19,
          -4,
          -14,
          27
        ]
      ],
      "expected": [
        [
          -14,
          -10
        ],
        [
          19,
          23
        ],
        [
          23,
          27
        ]
      ]
    },
    {
      "input": [
        [
          10,
          20
        ]
      ],
      "expected": [
        [
          10,
          20
        ]
      ]
    },
    {
      "input": [
        [
          -5,
          -4,
          0,
          1,
          10
        ]
      ],
      "expected": [
        [
          -5,
          -4
        ],
        [
          0,
          1
        ]
      ]
    }
  ],
  "set-mismatch": [
    {
      "input": [
        [
          1,
          1
        ]
      ],
      "expected": [
        1,
        2
      ]
    },
    {
      "input": [
        [
          2,
          2
        ]
      ],
      "expected": [
        2,
        1
      ]
    },
    {
      "input": [
        [
          3,
          2,
          3,
          4,
          6,
          5
        ]
      ],
      "expected": [
        3,
        1
      ]
    },
    {
      "input": [
        [
          1,
          5,
          3,
          2,
          2,
          7,
          6,
          4,
          8,
          9
        ]
      ],
      "expected": [
        2,
        10
      ]
    }
  ],
  "longest-continuous-increasing-subsequence": [
    {
      "input": [
        [
          5
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          5,
          4,
          3,
          2,
          1
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          -3,
          -2,
          -1,
          0,
          1
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          2,
          3,
          2,
          3,
          4,
          5,
          1
        ]
      ],
      "expected": 4
    }
  ],
  "positions-of-large-groups-easy": [
    {
      "input": [
        "abc"
      ],
      "expected": []
    },
    {
      "input": [
        "zzz"
      ],
      "expected": [
        [
          0,
          2
        ]
      ]
    },
    {
      "input": [
        "abcdddeeeeaabbbcd"
      ],
      "expected": [
        [
          3,
          5
        ],
        [
          6,
          9
        ],
        [
          12,
          14
        ]
      ]
    },
    {
      "input": [
        "aaaa"
      ],
      "expected": [
        [
          0,
          3
        ]
      ]
    },
    {
      "input": [
        "aabbaaa"
      ],
      "expected": [
        [
          4,
          6
        ]
      ]
    }
  ],
  "find-mode-in-binary-search-tree": [
    {
      "input": [
        [
          0
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        [
          5,
          3,
          7,
          3,
          4,
          6,
          8
        ]
      ],
      "expected": [
        3
      ]
    },
    {
      "input": [
        [
          2,
          1,
          2,
          null,
          null,
          2
        ]
      ],
      "expected": [
        2
      ]
    },
    {
      "input": [
        [
          10,
          5,
          15,
          5,
          5,
          12,
          20
        ]
      ],
      "expected": [
        5
      ]
    }
  ],
  "day-of-the-week": [
    {
      "input": [
        18,
        7,
        1999
      ],
      "expected": "Sunday"
    },
    {
      "input": [
        15,
        8,
        1993
      ],
      "expected": "Sunday"
    },
    {
      "input": [
        29,
        2,
        2020
      ],
      "expected": "Saturday"
    },
    {
      "input": [
        1,
        1,
        1971
      ],
      "expected": "Friday"
    },
    {
      "input": [
        31,
        12,
        2100
      ],
      "expected": "Friday"
    }
  ],
  "contains-duplicate-iii": [
    {
      "input": [
        [
          1,
          0,
          1,
          1
        ],
        1
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          3,
          1,
          2,
          3
        ],
        2
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2,
          1
        ],
        0
      ],
      "expected": false
    },
    {
      "input": [
        [
          5
        ],
        5
      ],
      "expected": false
    },
    {
      "input": [
        [
          -1,
          -1
        ],
        1
      ],
      "expected": true
    }
  ],
  "maximum-product-of-three-numbers": [
    {
      "input": [
        [
          -100,
          -98,
          -1,
          2,
          3,
          4
        ]
      ],
      "expected": 39200
    },
    {
      "input": [
        [
          -1,
          -2,
          -3
        ]
      ],
      "expected": -6
    },
    {
      "input": [
        [
          -10,
          -10,
          5,
          2
        ]
      ],
      "expected": 500
    },
    {
      "input": [
        [
          0,
          0,
          0,
          0
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          -5,
          -4,
          -3,
          -2,
          -1
        ]
      ],
      "expected": -6
    }
  ],
  "longest-common-prefix": [
    {
      "input": [
        [
          "single"
        ]
      ],
      "expected": "single"
    },
    {
      "input": [
        [
          "",
          "abc"
        ]
      ],
      "expected": ""
    },
    {
      "input": [
        [
          "ab",
          "a"
        ]
      ],
      "expected": "a"
    },
    {
      "input": [
        [
          "interspecies",
          "interstellar",
          "interstate"
        ]
      ],
      "expected": "inters"
    },
    {
      "input": [
        [
          "same",
          "same",
          "same"
        ]
      ],
      "expected": "same"
    }
  ],
  "nim-game": [
    {
      "input": [
        2
      ],
      "expected": true
    },
    {
      "input": [
        3
      ],
      "expected": true
    },
    {
      "input": [
        8
      ],
      "expected": false
    },
    {
      "input": [
        9
      ],
      "expected": true
    },
    {
      "input": [
        1000000000
      ],
      "expected": false
    }
  ],
  "leaf-similar-trees": [
    {
      "input": [
        [
          3,
          5,
          1,
          6,
          2,
          9,
          8,
          null,
          null,
          7,
          4
        ],
        [
          3,
          5,
          1,
          6,
          7,
          4,
          2,
          null,
          null,
          null,
          null,
          null,
          null,
          9,
          8
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ],
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ],
        [
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2
        ],
        [
          1,
          null,
          2
        ]
      ],
      "expected": true
    }
  ],
  "plus-one": [
    {
      "input": [
        [
          9
        ]
      ],
      "expected": [
        1,
        0
      ]
    },
    {
      "input": [
        [
          9,
          9,
          9
        ]
      ],
      "expected": [
        1,
        0,
        0,
        0
      ]
    },
    {
      "input": [
        [
          0
        ]
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        [
          4,
          3,
          2,
          1
        ]
      ],
      "expected": [
        4,
        3,
        2,
        2
      ]
    },
    {
      "input": [
        [
          1,
          9,
          9,
          9
        ]
      ],
      "expected": [
        2,
        0,
        0,
        0
      ]
    }
  ],
  "find-the-highest-altitude": [
    {
      "input": [
        [
          -4,
          -3,
          -2,
          -1,
          4,
          3,
          2
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          5
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          -5
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expected": 15
    },
    {
      "input": [
        [
          -1,
          -2,
          -3
        ]
      ],
      "expected": 0
    }
  ],
  "find-pivot-index": [
    {
      "input": [
        [
          1,
          2,
          3
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          2,
          1,
          -1
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          0
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          -1,
          -1,
          0,
          1,
          1,
          0
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          -1,
          2
        ]
      ],
      "expected": 2
    }
  ],
  "minimum-depth-of-binary-tree": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          2,
          null,
          3,
          null,
          4,
          null,
          5,
          null,
          6
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expected": 2
    }
  ],
  "uncommon-words-from-two-sentences": [
    {
      "input": [
        "apple apple",
        "banana"
      ],
      "expected": [
        "banana"
      ]
    },
    {
      "input": [
        "a b c",
        "a b c"
      ],
      "expected": []
    },
    {
      "input": [
        "same same",
        "same"
      ],
      "expected": []
    },
    {
      "input": [
        "hello world",
        "hello"
      ],
      "expected": [
        "world"
      ]
    }
  ],
  "subtree-of-another-tree-easy": [
    {
      "input": [
        [
          3,
          4,
          5,
          1,
          2,
          null,
          null,
          null,
          null,
          0
        ],
        [
          4,
          1,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          1
        ],
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ],
        [
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          4,
          1,
          2
        ],
        [
          4,
          1,
          2
        ]
      ],
      "expected": true
    }
  ],
  "min-cost-climbing-stairs-easy": [
    {
      "input": [
        [
          1,
          100,
          1,
          1,
          1,
          100,
          1,
          1,
          100,
          1
        ]
      ],
      "expected": 6
    },
    {
      "input": [
        [
          0,
          0
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          5,
          10
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          10,
          5,
          2,
          8,
          1
        ]
      ],
      "expected": 8
    }
  ],
  "next-greater-element-i": [
    {
      "input": [
        [
          2,
          4
        ],
        [
          1,
          2,
          3,
          4
        ]
      ],
      "expected": [
        3,
        -1
      ]
    },
    {
      "input": [
        [
          1
        ],
        [
          1
        ]
      ],
      "expected": [
        -1
      ]
    },
    {
      "input": [
        [
          5,
          4,
          3
        ],
        [
          5,
          4,
          3,
          2,
          1
        ]
      ],
      "expected": [
        -1,
        -1,
        -1
      ]
    },
    {
      "input": [
        [
          1,
          3,
          5,
          2,
          4
        ],
        [
          6,
          5,
          4,
          3,
          2,
          1,
          7
        ]
      ],
      "expected": [
        7,
        7,
        7,
        7,
        7
      ]
    }
  ],
  "reshape-the-matrix-easy": [
    {
      "input": [
        [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        2,
        4
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2,
            3,
            4
          ]
        ],
        2,
        2
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ]
    },
    {
      "input": [
        [
          [
            7
          ]
        ],
        1,
        1
      ],
      "expected": [
        [
          7
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2,
            3
          ],
          [
            4,
            5,
            6
          ]
        ],
        3,
        2
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ],
        [
          5,
          6
        ]
      ]
    }
  ],
  "path-sum": [
    {
      "input": [
        [],
        0
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2
        ],
        1
      ],
      "expected": false
    },
    {
      "input": [
        [
          1
        ],
        1
      ],
      "expected": true
    },
    {
      "input": [
        [
          -2,
          null,
          -3
        ],
        -5
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        5
      ],
      "expected": false
    }
  ],
  "move-zeroes": [
    {
      "input": [
        [
          0
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        [
          0,
          0,
          0
        ]
      ],
      "expected": [
        0,
        0,
        0
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3
        ]
      ],
      "expected": [
        1,
        2,
        3
      ]
    },
    {
      "input": [
        [
          0,
          0,
          1,
          0,
          2,
          0
        ]
      ],
      "expected": [
        1,
        2,
        0,
        0,
        0,
        0
      ]
    }
  ],
  "linked-list-cycle": [
    {
      "input": [
        [
          1,
          2
        ],
        0
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ],
        -1
      ],
      "expected": false
    },
    {
      "input": [
        [],
        -1
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4
        ],
        3
      ],
      "expected": true
    }
  ],
  "remove-duplicates-from-sorted-list": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        [
          1,
          1,
          2,
          3,
          3
        ]
      ],
      "expected": [
        1,
        2,
        3
      ]
    },
    {
      "input": [
        [
          -5,
          -5,
          -1,
          0,
          0,
          0
        ]
      ],
      "expected": [
        -5,
        -1,
        0
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4
        ]
      ],
      "expected": [
        1,
        2,
        3,
        4
      ]
    }
  ],
  "maximum-depth-of-binary-tree": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          null,
          2
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4,
          null,
          5
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5,
          6,
          7
        ]
      ],
      "expected": 3
    }
  ],
  "base-7": [
    {
      "input": [
        0
      ],
      "expected": "0"
    },
    {
      "input": [
        7
      ],
      "expected": "10"
    },
    {
      "input": [
        -100
      ],
      "expected": "-202"
    },
    {
      "input": [
        10000000
      ],
      "expected": "150666343"
    },
    {
      "input": [
        -1
      ],
      "expected": "-1"
    }
  ],
  "binary-tree-inorder-traversal": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          5
        ]
      ],
      "expected": [
        5
      ]
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": [
        4,
        3,
        2,
        1
      ]
    },
    {
      "input": [
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": [
        1,
        2,
        3
      ]
    },
    {
      "input": [
        [
          4,
          2,
          6,
          1,
          3,
          5,
          7
        ]
      ],
      "expected": [
        1,
        2,
        3,
        4,
        5,
        6,
        7
      ]
    }
  ],
  "find-the-index-of-the-first-occurrence-in-a-string": [
    {
      "input": [
        "a",
        "a"
      ],
      "expected": 0
    },
    {
      "input": [
        "aaa",
        "aaaa"
      ],
      "expected": -1
    },
    {
      "input": [
        "mississippi",
        "issip"
      ],
      "expected": 4
    },
    {
      "input": [
        "hello",
        "ll"
      ],
      "expected": 2
    },
    {
      "input": [
        "abc",
        ""
      ],
      "expected": 0
    }
  ],
  "height-checker": [
    {
      "input": [
        [
          5,
          1,
          2,
          3,
          4
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          7
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          2,
          1,
          2,
          1,
          1,
          2,
          2,
          1
        ]
      ],
      "expected": 4
    }
  ],
  "fair-candy-swap": [
    {
      "input": [
        [
          1,
          2
        ],
        [
          2,
          3
        ]
      ],
      "expected": [
        1,
        2
      ]
    },
    {
      "input": [
        [
          2
        ],
        [
          1,
          3
        ]
      ],
      "expected": [
        2,
        3
      ]
    },
    {
      "input": [
        [
          1,
          2,
          5
        ],
        [
          2,
          4
        ]
      ],
      "expected": [
        5,
        4
      ]
    },
    {
      "input": [
        [
          35,
          17,
          4,
          24,
          10
        ],
        [
          63,
          21
        ]
      ],
      "expected": [
        24,
        21
      ]
    }
  ],
  "can-place-flowers-easy": [
    {
      "input": [
        [
          1,
          0,
          0,
          0,
          1
        ],
        2
      ],
      "expected": false
    },
    {
      "input": [
        [
          0
        ],
        1
      ],
      "expected": true
    },
    {
      "input": [
        [
          0,
          0,
          0
        ],
        2
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          0,
          1,
          0,
          1
        ],
        1
      ],
      "expected": false
    },
    {
      "input": [
        [
          0,
          0,
          0,
          0,
          0
        ],
        3
      ],
      "expected": true
    }
  ],
  "diameter-of-binary-tree-easy": [
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5,
          null,
          null,
          6,
          null,
          null,
          7
        ]
      ],
      "expected": 4
    }
  ],
  "merge-two-binary-trees": [
    {
      "input": [
        [],
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          1
        ],
        [
          1,
          2
        ]
      ],
      "expected": [
        2,
        2
      ]
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3
        ],
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": [
        2,
        2,
        2,
        3,
        null,
        null,
        3
      ]
    },
    {
      "input": [
        [],
        [
          5,
          3,
          7
        ]
      ],
      "expected": [
        5,
        3,
        7
      ]
    }
  ],
  "word-pattern": [
    {
      "input": [
        "aaaa",
        "dog cat cat dog"
      ],
      "expected": false
    },
    {
      "input": [
        "abba",
        "dog dog dog dog"
      ],
      "expected": false
    },
    {
      "input": [
        "abc",
        "b c a"
      ],
      "expected": true
    },
    {
      "input": [
        "a",
        "a"
      ],
      "expected": true
    },
    {
      "input": [
        "ab",
        "dog"
      ],
      "expected": false
    }
  ],
  "search-insert-position": [
    {
      "input": [
        [
          1,
          3,
          5,
          6
        ],
        2
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          3,
          5,
          6
        ],
        7
      ],
      "expected": 4
    },
    {
      "input": [
        [
          1,
          3,
          5,
          6
        ],
        0
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1
        ],
        1
      ],
      "expected": 0
    },
    {
      "input": [
        [
          -5,
          -2,
          0,
          4
        ],
        -3
      ],
      "expected": 1
    }
  ],
  "jewels-and-stones": [
    {
      "input": [
        "z",
        "ZZ"
      ],
      "expected": 0
    },
    {
      "input": [
        "a",
        "aaaaa"
      ],
      "expected": 5
    },
    {
      "input": [
        "abc",
        ""
      ],
      "expected": 0
    },
    {
      "input": [
        "",
        "abc"
      ],
      "expected": 0
    },
    {
      "input": [
        "aAbB",
        "aAbBcCdD"
      ],
      "expected": 4
    }
  ],
  "is-subsequence": [
    {
      "input": [
        "axc",
        "ahbgdc"
      ],
      "expected": false
    },
    {
      "input": [
        "",
        "ahbgdc"
      ],
      "expected": true
    },
    {
      "input": [
        "abc",
        ""
      ],
      "expected": false
    },
    {
      "input": [
        "aaa",
        "aa"
      ],
      "expected": false
    },
    {
      "input": [
        "ace",
        "abcde"
      ],
      "expected": true
    }
  ],
  "maximum-product-of-three-numbers-easy": [
    {
      "input": [
        [
          -100,
          -98,
          -1,
          2,
          3,
          4
        ]
      ],
      "expected": 39200
    },
    {
      "input": [
        [
          -1,
          -2,
          -3
        ]
      ],
      "expected": -6
    },
    {
      "input": [
        [
          -10,
          -10,
          5,
          2
        ]
      ],
      "expected": 500
    },
    {
      "input": [
        [
          0,
          0,
          0
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          -5,
          -4,
          -3,
          -2,
          -1
        ]
      ],
      "expected": -6
    }
  ],
  "number-of-boomerangs": [
    {
      "input": [
        [
          [
            1,
            1
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          [
            1,
            1
          ],
          [
            2,
            2
          ],
          [
            3,
            3
          ]
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          [
            0,
            0
          ],
          [
            1,
            0
          ],
          [
            -1,
            0
          ],
          [
            0,
            1
          ],
          [
            0,
            -1
          ]
        ]
      ],
      "expected": 20
    },
    {
      "input": [
        [
          [
            0,
            0
          ],
          [
            1,
            0
          ],
          [
            0,
            2
          ]
        ]
      ],
      "expected": 0
    }
  ],
  "merge-two-sorted-lists": [
    {
      "input": [
        [],
        []
      ],
      "expected": []
    },
    {
      "input": [
        [],
        [
          0
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        [
          1,
          3,
          5
        ],
        []
      ],
      "expected": [
        1,
        3,
        5
      ]
    },
    {
      "input": [
        [
          -5,
          -1,
          2
        ],
        [
          -3,
          0,
          2,
          9
        ]
      ],
      "expected": [
        -5,
        -3,
        -1,
        0,
        2,
        2,
        9
      ]
    }
  ],
  "min-cost-climbing-stairs": [
    {
      "input": [
        [
          1,
          100,
          1,
          1,
          1,
          100,
          1,
          1,
          100,
          1
        ]
      ],
      "expected": 6
    },
    {
      "input": [
        [
          0,
          0
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          5,
          10
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          10,
          5,
          2,
          8,
          1
        ]
      ],
      "expected": 8
    }
  ],
  "power-of-three": [
    {
      "input": [
        1
      ],
      "expected": true
    },
    {
      "input": [
        3
      ],
      "expected": true
    },
    {
      "input": [
        9
      ],
      "expected": true
    },
    {
      "input": [
        45
      ],
      "expected": false
    },
    {
      "input": [
        1162261467
      ],
      "expected": true
    }
  ],
  "monotonic-array": [
    {
      "input": [
        [
          6,
          5,
          4,
          4
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          3,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          5,
          5,
          5,
          5
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          -5,
          -3,
          -3,
          0,
          10
        ]
      ],
      "expected": true
    }
  ],
  "reverse-linked-list": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          42
        ]
      ],
      "expected": [
        42
      ]
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": [
        2,
        1
      ]
    },
    {
      "input": [
        [
          -3,
          0,
          7,
          7
        ]
      ],
      "expected": [
        7,
        7,
        0,
        -3
      ]
    }
  ],
  "find-the-difference": [
    {
      "input": [
        "a",
        "aa"
      ],
      "expected": "a"
    },
    {
      "input": [
        "ae",
        "aea"
      ],
      "expected": "a"
    },
    {
      "input": [
        "xyz",
        "zyxw"
      ],
      "expected": "w"
    },
    {
      "input": [
        "bbbb",
        "bbbbb"
      ],
      "expected": "b"
    }
  ],
  "diameter-of-binary-tree": [
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5,
          null,
          null,
          6,
          null,
          null,
          7
        ]
      ],
      "expected": 4
    }
  ],
  "roman-to-integer": [
    {
      "input": [
        "IV"
      ],
      "expected": 4
    },
    {
      "input": [
        "IX"
      ],
      "expected": 9
    },
    {
      "input": [
        "MCMXCIV"
      ],
      "expected": 1994
    },
    {
      "input": [
        "MMMCMXCIX"
      ],
      "expected": 3999
    },
    {
      "input": [
        "XLII"
      ],
      "expected": 42
    }
  ],
  "goat-latin": [
    {
      "input": [
        "The quick brown fox jumped over the lazy dog"
      ],
      "expected": "heTmaa uickqmaaa rownbmaaaa oxfmaaaaa umpedjmaaaaaa overmaaaaaaa hetmaaaaaaaa azylmaaaaaaaaa ogdmaaaaaaaaaa"
    },
    {
      "input": [
        "a"
      ],
      "expected": "amaa"
    },
    {
      "input": [
        "Apple"
      ],
      "expected": "Applemaa"
    },
    {
      "input": [
        "Each word consists"
      ],
      "expected": "Eachmaa ordwmaaa onsistscmaaaa"
    }
  ],
  "two-sum-iv-input-is-a-bst": [
    {
      "input": [
        [
          5,
          3,
          6,
          2,
          4,
          null,
          7
        ],
        28
      ],
      "expected": false
    },
    {
      "input": [
        [
          2,
          1,
          3
        ],
        4
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ],
        2
      ],
      "expected": false
    },
    {
      "input": [
        [
          -3,
          -5,
          0,
          null,
          null,
          -1,
          4
        ],
        -4
      ],
      "expected": true
    }
  ],
  "matrix-diagonal-sum": [
    {
      "input": [
        [
          [
            5
          ]
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1
          ],
          [
            1,
            1,
            1,
            1
          ]
        ]
      ],
      "expected": 8
    },
    {
      "input": [
        [
          [
            -1,
            2
          ],
          [
            3,
            -4
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          [
            7,
            3,
            1,
            9
          ],
          [
            3,
            4,
            6,
            9
          ],
          [
            6,
            9,
            6,
            6
          ],
          [
            9,
            5,
            8,
            5
          ]
        ]
      ],
      "expected": 55
    }
  ],
  "transpose-matrix": [
    {
      "input": [
        [
          [
            1,
            2,
            3
          ],
          [
            4,
            5,
            6
          ]
        ]
      ],
      "expected": [
        [
          1,
          4
        ],
        [
          2,
          5
        ],
        [
          3,
          6
        ]
      ]
    },
    {
      "input": [
        [
          [
            42
          ]
        ]
      ],
      "expected": [
        [
          42
        ]
      ]
    },
    {
      "input": [
        [
          [
            1
          ],
          [
            2
          ],
          [
            3
          ]
        ]
      ],
      "expected": [
        [
          1,
          2,
          3
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2,
            3,
            4
          ]
        ]
      ],
      "expected": [
        [
          1
        ],
        [
          2
        ],
        [
          3
        ],
        [
          4
        ]
      ]
    }
  ],
  "find-common-characters": [
    {
      "input": [
        [
          "cool",
          "lock",
          "cook"
        ]
      ],
      "expected": [
        "c",
        "o"
      ]
    },
    {
      "input": [
        [
          "abc",
          "def"
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          "aaa",
          "aa",
          "aaaa"
        ]
      ],
      "expected": [
        "a",
        "a"
      ]
    },
    {
      "input": [
        [
          "z"
        ]
      ],
      "expected": [
        "z"
      ]
    }
  ],
  "rotate-string": [
    {
      "input": [
        "abcde",
        "abced"
      ],
      "expected": false
    },
    {
      "input": [
        "a",
        "a"
      ],
      "expected": true
    },
    {
      "input": [
        "aa",
        "a"
      ],
      "expected": false
    },
    {
      "input": [
        "bbbacddceeb",
        "ceebbbbacdd"
      ],
      "expected": true
    }
  ],
  "missing-number": [
    {
      "input": [
        [
          0,
          1
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          9,
          6,
          4,
          2,
          3,
          5,
          7,
          0,
          1
        ]
      ],
      "expected": 8
    },
    {
      "input": [
        [
          0
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expected": 0
    }
  ],
  "flipping-an-image-easy": [
    {
      "input": [
        [
          [
            1
          ]
        ]
      ],
      "expected": [
        [
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            0
          ]
        ]
      ],
      "expected": [
        [
          1
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            0,
            0,
            1
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            1,
            0,
            1,
            0
          ]
        ]
      ],
      "expected": [
        [
          1,
          1,
          0,
          0
        ],
        [
          0,
          1,
          1,
          0
        ],
        [
          0,
          0,
          0,
          1
        ],
        [
          1,
          0,
          1,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            0,
            1
          ],
          [
            1,
            0
          ]
        ]
      ],
      "expected": [
        [
          0,
          1
        ],
        [
          1,
          0
        ]
      ]
    }
  ],
  "isomorphic-strings": [
    {
      "input": [
        "paper",
        "title"
      ],
      "expected": true
    },
    {
      "input": [
        "badc",
        "baba"
      ],
      "expected": false
    },
    {
      "input": [
        "a",
        "z"
      ],
      "expected": true
    },
    {
      "input": [
        "ab",
        "aa"
      ],
      "expected": false
    },
    {
      "input": [
        "egg",
        "eee"
      ],
      "expected": false
    }
  ],
  "degree-of-an-array": [
    {
      "input": [
        [
          1,
          2,
          2,
          3,
          1,
          4,
          2
        ]
      ],
      "expected": 6
    },
    {
      "input": [
        [
          7
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          2,
          1,
          1,
          2,
          1,
          3,
          3,
          3,
          1,
          3,
          1,
          3,
          2
        ]
      ],
      "expected": 7
    }
  ],
  "number-of-lines-to-write-string": [
    {
      "input": [
        [
          4,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10
        ],
        "bbbcccdddaaa"
      ],
      "expected": [
        2,
        4
      ]
    },
    {
      "input": [
        [
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10
        ],
        "a"
      ],
      "expected": [
        1,
        10
      ]
    },
    {
      "input": [
        [
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10,
          10
        ],
        "abcdefghij"
      ],
      "expected": [
        1,
        100
      ]
    },
    {
      "input": [
        [
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50,
          50
        ],
        "abc"
      ],
      "expected": [
        2,
        50
      ]
    }
  ],
  "sign-of-the-product-of-an-array": [
    {
      "input": [
        [
          1,
          5,
          0,
          2,
          -3
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          -1,
          1,
          -1,
          1,
          -1
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          -1
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          1000000,
          1000000,
          -1000000
        ]
      ],
      "expected": -1
    }
  ],
  "shortest-distance-to-a-character": [
    {
      "input": [
        "aaab",
        "b"
      ],
      "expected": [
        3,
        2,
        1,
        0
      ]
    },
    {
      "input": [
        "a",
        "a"
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        "baaa",
        "b"
      ],
      "expected": [
        0,
        1,
        2,
        3
      ]
    },
    {
      "input": [
        "abaa",
        "b"
      ],
      "expected": [
        1,
        0,
        1,
        2
      ]
    }
  ],
  "minimum-index-sum-of-two-lists": [
    {
      "input": [
        [
          "Shogun",
          "Tapioca Express",
          "Burger King",
          "KFC"
        ],
        [
          "KFC",
          "Shogun",
          "Burger King"
        ]
      ],
      "expected": [
        "Shogun"
      ]
    },
    {
      "input": [
        [
          "a",
          "b"
        ],
        [
          "b",
          "a",
          "c"
        ]
      ],
      "expected": [
        "b",
        "a"
      ]
    },
    {
      "input": [
        [
          "only"
        ],
        [
          "x",
          "y",
          "only"
        ]
      ],
      "expected": [
        "only"
      ]
    },
    {
      "input": [
        [
          "first",
          "second"
        ],
        [
          "first",
          "other"
        ]
      ],
      "expected": [
        "first"
      ]
    }
  ],
  "excel-sheet-column-number": [
    {
      "input": [
        "Z"
      ],
      "expected": 26
    },
    {
      "input": [
        "ZY"
      ],
      "expected": 701
    },
    {
      "input": [
        "FXSHRXW"
      ],
      "expected": 2147483647
    },
    {
      "input": [
        "AA"
      ],
      "expected": 27
    },
    {
      "input": [
        "ZZ"
      ],
      "expected": 702
    }
  ],
  "baseball-game": [
    {
      "input": [
        [
          "5",
          "-2",
          "4",
          "C",
          "D",
          "9",
          "+",
          "+"
        ]
      ],
      "expected": 27
    },
    {
      "input": [
        [
          "1",
          "C"
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          "10"
        ]
      ],
      "expected": 10
    },
    {
      "input": [
        [
          "-5",
          "D",
          "+"
        ]
      ],
      "expected": -30
    }
  ],
  "assign-cookies": [
    {
      "input": [
        [
          1,
          2,
          3
        ],
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          10,
          9,
          8,
          7
        ],
        [
          5,
          6,
          7,
          8
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          1,
          1,
          1
        ],
        [
          1,
          1,
          1
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          5
        ],
        [
          4
        ]
      ],
      "expected": 0
    }
  ],
  "richest-customer-wealth": [
    {
      "input": [
        [
          [
            1,
            5
          ],
          [
            7,
            3
          ],
          [
            3,
            5
          ]
        ]
      ],
      "expected": 10
    },
    {
      "input": [
        [
          [
            2,
            8,
            7
          ],
          [
            7,
            1,
            3
          ],
          [
            1,
            9,
            5
          ]
        ]
      ],
      "expected": 17
    },
    {
      "input": [
        [
          [
            0
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          [
            100,
            200
          ],
          [
            50,
            50
          ]
        ]
      ],
      "expected": 300
    }
  ],
  "sqrtx": [
    {
      "input": [
        0
      ],
      "expected": 0
    },
    {
      "input": [
        1
      ],
      "expected": 1
    },
    {
      "input": [
        2
      ],
      "expected": 1
    },
    {
      "input": [
        15
      ],
      "expected": 3
    },
    {
      "input": [
        2147395599
      ],
      "expected": 46339
    },
    {
      "input": [
        2147483647
      ],
      "expected": 46340
    }
  ],
  "same-tree": [
    {
      "input": [
        [],
        []
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2
        ],
        [
          1,
          null,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2,
          1
        ],
        [
          1,
          1,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1
        ],
        [
          1
        ]
      ],
      "expected": true
    }
  ],
  "construct-string-from-binary-tree": [
    {
      "input": [
        [
          1,
          2,
          3,
          null,
          4
        ]
      ],
      "expected": "1(2()(4))(3)"
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": "1"
    },
    {
      "input": [
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": "1()(2()(3))"
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3
        ]
      ],
      "expected": "1(2(3))"
    }
  ],
  "valid-palindrome-ii": [
    {
      "input": [
        "a"
      ],
      "expected": true
    },
    {
      "input": [
        "deeee"
      ],
      "expected": true
    },
    {
      "input": [
        "tebbem"
      ],
      "expected": false
    },
    {
      "input": [
        "aguokepatgbnvfqmgmlcupuufxoohdfpgjdmysgvhmvffcnqxjjxqncffvmhvgsymdjgpfdhooxfuupuculmgmqfvnbgtapekouga"
      ],
      "expected": true
    }
  ],
  "island-perimeter": [
    {
      "input": [
        [
          [
            1
          ]
        ]
      ],
      "expected": 4
    },
    {
      "input": [
        [
          [
            1,
            0
          ]
        ]
      ],
      "expected": 4
    },
    {
      "input": [
        [
          [
            1,
            1
          ],
          [
            1,
            1
          ]
        ]
      ],
      "expected": 8
    },
    {
      "input": [
        [
          [
            0,
            0
          ],
          [
            0,
            0
          ]
        ]
      ],
      "expected": 0
    }
  ],
  "buddy-strings": [
    {
      "input": [
        "ab",
        "ab"
      ],
      "expected": false
    },
    {
      "input": [
        "aa",
        "aa"
      ],
      "expected": true
    },
    {
      "input": [
        "aaaaaaabc",
        "aaaaaaacb"
      ],
      "expected": true
    },
    {
      "input": [
        "a",
        "a"
      ],
      "expected": false
    },
    {
      "input": [
        "ab",
        "abc"
      ],
      "expected": false
    }
  ],
  "decompress-run-length-encoded-list": [
    {
      "input": [
        [
          1,
          1,
          2,
          3
        ]
      ],
      "expected": [
        1,
        3,
        3
      ]
    },
    {
      "input": [
        [
          5,
          0
        ]
      ],
      "expected": [
        0,
        0,
        0,
        0,
        0
      ]
    },
    {
      "input": [
        [
          1,
          99
        ]
      ],
      "expected": [
        99
      ]
    },
    {
      "input": [
        [
          2,
          7,
          3,
          8,
          1,
          9
        ]
      ],
      "expected": [
        7,
        7,
        8,
        8,
        8,
        9
      ]
    }
  ],
  "count-binary-substrings": [
    {
      "input": [
        "10101"
      ],
      "expected": 4
    },
    {
      "input": [
        "0"
      ],
      "expected": 0
    },
    {
      "input": [
        "0000"
      ],
      "expected": 0
    },
    {
      "input": [
        "00011100"
      ],
      "expected": 5
    },
    {
      "input": [
        "11001100"
      ],
      "expected": 6
    }
  ],
  "merge-two-binary-trees-easy": [
    {
      "input": [
        [],
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          1
        ],
        [
          1,
          2
        ]
      ],
      "expected": [
        2,
        2
      ]
    },
    {
      "input": [
        [
          1,
          2,
          null,
          3
        ],
        [
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": [
        2,
        2,
        2,
        3,
        null,
        null,
        3
      ]
    },
    {
      "input": [
        [
          5,
          3,
          7
        ],
        []
      ],
      "expected": [
        5,
        3,
        7
      ]
    }
  ],
  "symmetric-tree": [
    {
      "input": [
        []
      ],
      "expected": true
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          2,
          null,
          3,
          null,
          3
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2,
          2,
          null,
          3,
          3
        ]
      ],
      "expected": true
    }
  ],
  "self-dividing-numbers": [
    {
      "input": [
        47,
        85
      ],
      "expected": [
        48,
        55,
        66,
        77
      ]
    },
    {
      "input": [
        1,
        1
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        10,
        10
      ],
      "expected": []
    },
    {
      "input": [
        66,
        708
      ],
      "expected": [
        66,
        77,
        88,
        99,
        111,
        112,
        115,
        122,
        124,
        126,
        128,
        132,
        135,
        144,
        155,
        162,
        168,
        175,
        184,
        212,
        216,
        222,
        224,
        244,
        248,
        264,
        288,
        312,
        315,
        324,
        333,
        336,
        366,
        384,
        396,
        412,
        424,
        432,
        444,
        448,
        488,
        515,
        555,
        612,
        624,
        636,
        648,
        666,
        672
      ]
    }
  ],
  "hamming-distance": [
    {
      "input": [
        3,
        1
      ],
      "expected": 1
    },
    {
      "input": [
        0,
        0
      ],
      "expected": 0
    },
    {
      "input": [
        0,
        2147483647
      ],
      "expected": 31
    },
    {
      "input": [
        93,
        73
      ],
      "expected": 2
    }
  ],
  "fibonacci-number": [
    {
      "input": [
        0
      ],
      "expected": 0
    },
    {
      "input": [
        1
      ],
      "expected": 1
    },
    {
      "input": [
        4
      ],
      "expected": 3
    },
    {
      "input": [
        10
      ],
      "expected": 55
    },
    {
      "input": [
        30
      ],
      "expected": 832040
    }
  ],
  "intersection-of-two-arrays-ii": [
    {
      "input": [
        [],
        [
          1
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ],
      "expected": []
    },
    {
      "input": [
        [
          5,
          5,
          5
        ],
        [
          5,
          5
        ]
      ],
      "expected": [
        5,
        5
      ]
    },
    {
      "input": [
        [
          7,
          1,
          2
        ],
        [
          7,
          7,
          9
        ]
      ],
      "expected": [
        7
      ]
    }
  ],
  "happy-number": [
    {
      "input": [
        1
      ],
      "expected": true
    },
    {
      "input": [
        7
      ],
      "expected": true
    },
    {
      "input": [
        4
      ],
      "expected": false
    },
    {
      "input": [
        100
      ],
      "expected": true
    },
    {
      "input": [
        1111111
      ],
      "expected": true
    }
  ],
  "counting-bits": [
    {
      "input": [
        0
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        1
      ],
      "expected": [
        0,
        1
      ]
    },
    {
      "input": [
        5
      ],
      "expected": [
        0,
        1,
        1,
        2,
        1,
        2
      ]
    },
    {
      "input": [
        15
      ],
      "expected": [
        0,
        1,
        1,
        2,
        1,
        2,
        2,
        3,
        1,
        2,
        2,
        3,
        2,
        3,
        3,
        4
      ]
    }
  ],
  "can-place-flowers": [
    {
      "input": [
        [
          1,
          0,
          0,
          0,
          1
        ],
        2
      ],
      "expected": false
    },
    {
      "input": [
        [
          0
        ],
        1
      ],
      "expected": true
    },
    {
      "input": [
        [
          0,
          0,
          0
        ],
        2
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          0,
          1,
          0,
          1
        ],
        1
      ],
      "expected": false
    },
    {
      "input": [
        [
          0,
          0,
          0,
          0,
          0
        ],
        3
      ],
      "expected": true
    }
  ],
  "maximum-depth-of-n-ary-tree": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          null,
          2,
          3,
          4,
          5,
          null,
          null,
          6,
          7,
          null,
          8,
          null,
          9,
          10,
          null,
          null,
          11,
          null,
          12,
          null,
          13,
          null,
          null,
          14
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          null,
          2,
          null,
          3,
          null,
          4
        ]
      ],
      "expected": 4
    }
  ],
  "find-all-anagrams-in-a-string-easy": [
    {
      "input": [
        "abab",
        "ab"
      ],
      "expected": [
        0,
        1,
        2
      ]
    },
    {
      "input": [
        "a",
        "ab"
      ],
      "expected": []
    },
    {
      "input": [
        "aaaa",
        "aa"
      ],
      "expected": [
        0,
        1,
        2
      ]
    },
    {
      "input": [
        "abcdef",
        "xyz"
      ],
      "expected": []
    }
  ],
  "excel-sheet-column-title": [
    {
      "input": [
        26
      ],
      "expected": "Z"
    },
    {
      "input": [
        27
      ],
      "expected": "AA"
    },
    {
      "input": [
        701
      ],
      "expected": "ZY"
    },
    {
      "input": [
        2147483647
      ],
      "expected": "FXSHRXW"
    }
  ],
  "reverse-vowels-of-a-string": [
    {
      "input": [
        "aA"
      ],
      "expected": "Aa"
    },
    {
      "input": [
        "bcdfg"
      ],
      "expected": "bcdfg"
    },
    {
      "input": [
        ""
      ],
      "expected": ""
    },
    {
      "input": [
        "AEIOU"
      ],
      "expected": "UOIEA"
    },
    {
      "input": [
        "a."
      ],
      "expected": "a."
    }
  ],
  "palindrome-linked-list": [
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          3,
          2,
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          -1,
          2,
          2,
          -1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4
        ]
      ],
      "expected": false
    }
  ],
  "reshape-the-matrix": [
    {
      "input": [
        [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        2,
        4
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2,
            3,
            4
          ]
        ],
        2,
        2
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ]
      ]
    },
    {
      "input": [
        [
          [
            9
          ]
        ],
        1,
        1
      ],
      "expected": [
        [
          9
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            2,
            3
          ],
          [
            4,
            5,
            6
          ]
        ],
        3,
        2
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          4
        ],
        [
          5,
          6
        ]
      ]
    }
  ],
  "number-of-segments-in-a-string": [
    {
      "input": [
        ""
      ],
      "expected": 0
    },
    {
      "input": [
        "     "
      ],
      "expected": 0
    },
    {
      "input": [
        "a, b, c"
      ],
      "expected": 3
    },
    {
      "input": [
        "   one   two   three   "
      ],
      "expected": 3
    }
  ],
  "toeplitz-matrix": [
    {
      "input": [
        [
          [
            1,
            2
          ],
          [
            2,
            2
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            5
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            1,
            2,
            3
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            1
          ],
          [
            2
          ],
          [
            3
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            1,
            2,
            3
          ],
          [
            4,
            1,
            2
          ],
          [
            5,
            4,
            1
          ]
        ]
      ],
      "expected": true
    }
  ],
  "lemonade-change": [
    {
      "input": [
        [
          5,
          5,
          10,
          10,
          20
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          10
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          5,
          5,
          5,
          20
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          5,
          5,
          10,
          20,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          5,
          10,
          5,
          5,
          20,
          5,
          20,
          5
        ]
      ],
      "expected": true
    }
  ],
  "duplicate-zeros": [
    {
      "input": [
        [
          1,
          2,
          3
        ]
      ],
      "expected": [
        1,
        2,
        3
      ]
    },
    {
      "input": [
        [
          0,
          0,
          0
        ]
      ],
      "expected": [
        0,
        0,
        0
      ]
    },
    {
      "input": [
        [
          0
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        [
          8,
          4,
          5,
          0,
          0,
          0,
          0,
          7
        ]
      ],
      "expected": [
        8,
        4,
        5,
        0,
        0,
        0,
        0,
        0
      ]
    }
  ],
  "relative-sort-array": [
    {
      "input": [
        [
          28,
          6,
          22,
          8,
          44,
          17
        ],
        [
          22,
          28,
          8,
          6
        ]
      ],
      "expected": [
        22,
        28,
        8,
        6,
        17,
        44
      ]
    },
    {
      "input": [
        [
          5,
          3,
          1
        ],
        []
      ],
      "expected": [
        1,
        3,
        5
      ]
    },
    {
      "input": [
        [
          2,
          2,
          1
        ],
        [
          1,
          2
        ]
      ],
      "expected": [
        1,
        2,
        2
      ]
    },
    {
      "input": [
        [
          10
        ],
        [
          10
        ]
      ],
      "expected": [
        10
      ]
    }
  ],
  "student-attendance-record-i": [
    {
      "input": [
        "A"
      ],
      "expected": true
    },
    {
      "input": [
        "AA"
      ],
      "expected": false
    },
    {
      "input": [
        "LLL"
      ],
      "expected": false
    },
    {
      "input": [
        "LALL"
      ],
      "expected": true
    },
    {
      "input": [
        "PPALLLP"
      ],
      "expected": false
    }
  ],
  "binary-gap": [
    {
      "input": [
        8
      ],
      "expected": 0
    },
    {
      "input": [
        5
      ],
      "expected": 2
    },
    {
      "input": [
        6
      ],
      "expected": 1
    },
    {
      "input": [
        1
      ],
      "expected": 0
    },
    {
      "input": [
        1041
      ],
      "expected": 6
    }
  ],
  "flipping-an-image": [
    {
      "input": [
        [
          [
            1
          ]
        ]
      ],
      "expected": [
        [
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            0
          ]
        ]
      ],
      "expected": [
        [
          1
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            1,
            0,
            0
          ],
          [
            1,
            0,
            0,
            1
          ],
          [
            0,
            1,
            1,
            1
          ],
          [
            1,
            0,
            1,
            0
          ]
        ]
      ],
      "expected": [
        [
          1,
          1,
          0,
          0
        ],
        [
          0,
          1,
          1,
          0
        ],
        [
          0,
          0,
          0,
          1
        ],
        [
          1,
          0,
          1,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            0,
            1
          ],
          [
            1,
            0
          ]
        ]
      ],
      "expected": [
        [
          0,
          1
        ],
        [
          1,
          0
        ]
      ]
    }
  ],
  "largest-number-at-least-twice-of-others-easy": [
    {
      "input": [
        [
          1,
          2,
          3,
          4
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          0,
          0,
          0,
          1
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          0,
          0,
          3,
          2
        ]
      ],
      "expected": -1
    }
  ],
  "valid-palindrome": [
    {
      "input": [
        " "
      ],
      "expected": true
    },
    {
      "input": [
        "a"
      ],
      "expected": true
    },
    {
      "input": [
        "0P"
      ],
      "expected": false
    },
    {
      "input": [
        "No lemon, no melon!"
      ],
      "expected": true
    },
    {
      "input": [
        "ab_a"
      ],
      "expected": true
    }
  ],
  "reverse-words-in-a-string": [
    {
      "input": [
        "the sky is blue"
      ],
      "expected": "blue is sky the"
    },
    {
      "input": [
        "   single   "
      ],
      "expected": "single"
    },
    {
      "input": [
        "a   b   c"
      ],
      "expected": "c b a"
    },
    {
      "input": [
        "hello"
      ],
      "expected": "hello"
    }
  ],
  "longest-uncommon-subsequence-i": [
    {
      "input": [
        "a",
        "b"
      ],
      "expected": 1
    },
    {
      "input": [
        "abc",
        "abcd"
      ],
      "expected": 4
    },
    {
      "input": [
        "abcd",
        "abc"
      ],
      "expected": 4
    },
    {
      "input": [
        "",
        "a"
      ],
      "expected": 1
    }
  ]
};
