import type { ProblemTestCase } from '../submissionRunner';

/**
 * Phase 7 curated server-only hidden test cases for Medium problems (135 problems, 562 cases).
 * Every expected value is independently verified against tests/oracles/medium.ts.
 */
export const PHASE7_MEDIUM_HIDDEN_TESTS: Readonly<Record<string, readonly ProblemTestCase[]>> = {
  "eulerian-path-and-circuit": [
    {
      "input": [
        3,
        [
          [
            1,
            2
          ],
          [
            0,
            2
          ],
          [
            0,
            1
          ]
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        4,
        [
          [
            1,
            2,
            3
          ],
          [
            0,
            2,
            3
          ],
          [
            0,
            1,
            3
          ],
          [
            0,
            1,
            2
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        4,
        [
          [
            1
          ],
          [
            0
          ],
          [
            3
          ],
          [
            2
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        3,
        [
          [],
          [],
          []
        ]
      ],
      "expected": 2
    }
  ],
  "construct-binary-tree-from-inorder-and-postorder-traversal": [
    {
      "input": [
        [
          -1
        ],
        [
          -1
        ]
      ],
      "expected": [
        -1
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        [
          3,
          2,
          1
        ]
      ],
      "expected": [
        1,
        null,
        2,
        null,
        3
      ]
    },
    {
      "input": [
        [
          3,
          2,
          1
        ],
        [
          3,
          2,
          1
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
          4,
          2,
          5,
          1,
          6,
          3,
          7
        ],
        [
          4,
          5,
          2,
          6,
          7,
          3,
          1
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
  "01-matrix": [
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
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            0,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            1,
            1,
            1
          ]
        ]
      ],
      "expected": [
        [
          0,
          0,
          0
        ],
        [
          0,
          1,
          0
        ],
        [
          1,
          2,
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
            1
          ],
          [
            1,
            1,
            1
          ],
          [
            1,
            1,
            0
          ]
        ]
      ],
      "expected": [
        [
          4,
          3,
          2
        ],
        [
          3,
          2,
          1
        ],
        [
          2,
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
            1,
            1,
            1,
            0
          ]
        ]
      ],
      "expected": [
        [
          0,
          1,
          2,
          1,
          0
        ]
      ]
    }
  ],
  "binary-tree-level-order-traversal": [
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
        [
          1
        ]
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
        [
          1
        ],
        [
          2,
          3
        ],
        [
          4,
          5
        ]
      ]
    }
  ],
  "4sum": [
    {
      "input": [
        [
          1,
          2,
          3
        ],
        6
      ],
      "expected": []
    },
    {
      "input": [
        [
          0,
          0,
          0,
          0
        ],
        0
      ],
      "expected": [
        [
          0,
          0,
          0,
          0
        ]
      ]
    },
    {
      "input": [
        [
          -5,
          -4,
          -3,
          -2,
          -1
        ],
        -10
      ],
      "expected": [
        [
          -4,
          -3,
          -2,
          -1
        ]
      ]
    },
    {
      "input": [
        [
          10,
          20,
          30,
          40
        ],
        999
      ],
      "expected": []
    }
  ],
  "graph-coloring": [
    {
      "input": [
        [
          [
            0,
            1,
            1
          ],
          [
            1,
            0,
            1
          ],
          [
            1,
            1,
            0
          ]
        ],
        2,
        3
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            0,
            1,
            1
          ],
          [
            1,
            0,
            1
          ],
          [
            1,
            1,
            0
          ]
        ],
        3,
        3
      ],
      "expected": true
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
        ],
        1,
        2
      ],
      "expected": true
    },
    {
      "input": [
        [
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
            1
          ],
          [
            1,
            1,
            0,
            1
          ],
          [
            1,
            1,
            1,
            0
          ]
        ],
        3,
        4
      ],
      "expected": false
    }
  ],
  "pacific-atlantic-water-flow": [
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
          0,
          0
        ]
      ]
    },
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
          0,
          0
        ]
      ]
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
            2
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
          1
        ],
        [
          1,
          0
        ],
        [
          1,
          1
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
            2,
            3,
            2
          ],
          [
            3,
            2,
            1
          ]
        ]
      ],
      "expected": [
        [
          0,
          2
        ],
        [
          1,
          1
        ],
        [
          2,
          0
        ]
      ]
    }
  ],
  "lowest-common-ancestor-of-a-binary-tree": [
    {
      "input": [
        [
          3,
          5,
          1,
          6,
          2,
          0,
          8,
          null,
          null,
          7,
          4
        ],
        5,
        4
      ],
      "expected": 5
    },
    {
      "input": [
        [
          1,
          2
        ],
        1,
        2
      ],
      "expected": 1
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
        ],
        4,
        7
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
        ],
        3,
        4
      ],
      "expected": 3
    }
  ],
  "string-to-integer-atoi": [
    {
      "input": [
        "4193 with words"
      ],
      "expected": 4193
    },
    {
      "input": [
        "words and 987"
      ],
      "expected": 0
    },
    {
      "input": [
        "-91283472332"
      ],
      "expected": -2147483648
    },
    {
      "input": [
        "91283472332"
      ],
      "expected": 2147483647
    },
    {
      "input": [
        "  +00123abc"
      ],
      "expected": 123
    },
    {
      "input": [
        ""
      ],
      "expected": 0
    }
  ],
  "3sum-closest": [
    {
      "input": [
        [
          1,
          1,
          1,
          0
        ],
        -100
      ],
      "expected": 2
    },
    {
      "input": [
        [
          -10,
          -5,
          0,
          5,
          10
        ],
        1
      ],
      "expected": 0
    },
    {
      "input": [
        [
          4,
          0,
          5,
          -5,
          3,
          3,
          0,
          -4,
          -5
        ],
        -2
      ],
      "expected": -2
    },
    {
      "input": [
        [
          1,
          2,
          4,
          8,
          16,
          32,
          64,
          128
        ],
        82
      ],
      "expected": 82
    }
  ],
  "ones-and-zeroes": [
    {
      "input": [
        [
          "10",
          "0",
          "1"
        ],
        1,
        1
      ],
      "expected": 2
    },
    {
      "input": [
        [
          "0",
          "0",
          "0"
        ],
        2,
        0
      ],
      "expected": 2
    },
    {
      "input": [
        [
          "111",
          "000"
        ],
        2,
        2
      ],
      "expected": 0
    },
    {
      "input": [
        [
          "10",
          "0001",
          "111001",
          "1",
          "0"
        ],
        4,
        3
      ],
      "expected": 3
    }
  ],
  "remove-duplicates-from-sorted-array-ii": [
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
          1,
          1,
          1
        ]
      ],
      "expected": [
        1,
        1
      ]
    },
    {
      "input": [
        [
          -3,
          -3,
          -3,
          0,
          0,
          0,
          5
        ]
      ],
      "expected": [
        -3,
        -3,
        0,
        0,
        5
      ]
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
      "expected": [
        1,
        2,
        3,
        4,
        5
      ]
    }
  ],
  "add-two-numbers-ii": [
    {
      "input": [
        [
          0
        ],
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
          9,
          9,
          9
        ],
        [
          1
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
          5
        ],
        [
          5
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
          2,
          4,
          3
        ],
        [
          5,
          6,
          4
        ]
      ],
      "expected": [
        8,
        0,
        7
      ]
    }
  ],
  "design-add-and-search-words-data-structure": [
    {
      "input": [
        [
          "WordDictionary",
          "search"
        ],
        [
          [],
          [
            "a"
          ]
        ]
      ],
      "expected": [
        null,
        false
      ]
    },
    {
      "input": [
        [
          "WordDictionary",
          "addWord",
          "search",
          "search",
          "search"
        ],
        [
          [],
          [
            "a"
          ],
          [
            "."
          ],
          [
            "a"
          ],
          [
            "aa"
          ]
        ]
      ],
      "expected": [
        null,
        null,
        true,
        true,
        false
      ]
    },
    {
      "input": [
        [
          "WordDictionary",
          "addWord",
          "addWord",
          "search",
          "search",
          "search"
        ],
        [
          [],
          [
            "at"
          ],
          [
            "and"
          ],
          [
            "a."
          ],
          [
            ".t"
          ],
          [
            "..."
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        true,
        true,
        true
      ]
    },
    {
      "input": [
        [
          "WordDictionary",
          "addWord",
          "addWord",
          "search",
          "search"
        ],
        [
          [],
          [
            "hello"
          ],
          [
            "hallo"
          ],
          [
            "h.llo"
          ],
          [
            "h..lo"
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        true,
        true
      ]
    }
  ],
  "reverse-linked-list-ii": [
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ],
        1,
        5
      ],
      "expected": [
        5,
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
          2,
          3,
          4,
          5
        ],
        1,
        2
      ],
      "expected": [
        2,
        1,
        3,
        4,
        5
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ],
        4,
        5
      ],
      "expected": [
        1,
        2,
        3,
        5,
        4
      ]
    },
    {
      "input": [
        [
          3,
          5
        ],
        1,
        2
      ],
      "expected": [
        5,
        3
      ]
    }
  ],
  "longest-arithmetic-subsequence": [
    {
      "input": [
        [
          9,
          4,
          7,
          2,
          10
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          20,
          1,
          15,
          3,
          10,
          5,
          8
        ]
      ],
      "expected": 4
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
      "expected": 4
    },
    {
      "input": [
        [
          1,
          2
        ]
      ],
      "expected": 2
    }
  ],
  "maximal-square": [
    {
      "input": [
        [
          [
            "0",
            "1"
          ],
          [
            "1",
            "0"
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            "0"
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          [
            "1"
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            "1",
            "1",
            "1"
          ],
          [
            "1",
            "1",
            "1"
          ],
          [
            "1",
            "1",
            "1"
          ]
        ]
      ],
      "expected": 9
    }
  ],
  "binary-tree-zigzag-level-order-traversal": [
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
        [
          1
        ]
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
        [
          1
        ],
        [
          3,
          2
        ],
        [
          4,
          5
        ]
      ]
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
      "expected": [
        [
          1
        ],
        [
          3,
          2
        ],
        [
          4,
          5,
          6,
          7
        ]
      ]
    }
  ],
  "reorder-list": [
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
          2
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
          1,
          2,
          3,
          4,
          5
        ]
      ],
      "expected": [
        1,
        5,
        2,
        4,
        3
      ]
    },
    {
      "input": [
        [
          10,
          20,
          30,
          40,
          50,
          60
        ]
      ],
      "expected": [
        10,
        60,
        20,
        50,
        30,
        40
      ]
    }
  ],
  "out-of-boundary-paths": [
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
  "is-graph-bipartite": [
    {
      "input": [
        [
          [
            1,
            3
          ],
          [
            0,
            2
          ],
          [
            1,
            3
          ],
          [
            0,
            2
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          []
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
            0
          ],
          [
            3,
            4
          ],
          [
            2,
            4
          ],
          [
            2,
            3
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            1
          ],
          [
            0
          ],
          [],
          [
            4
          ],
          [
            3
          ]
        ]
      ],
      "expected": true
    }
  ],
  "bridge-edge-in-graph": [
    {
      "input": [
        4,
        [
          [
            1,
            3
          ],
          [
            0,
            2
          ],
          [
            1,
            3
          ],
          [
            0,
            2
          ]
        ],
        1,
        2
      ],
      "expected": 0
    },
    {
      "input": [
        3,
        [
          [
            1
          ],
          [
            0,
            2
          ],
          [
            1
          ]
        ],
        0,
        1
      ],
      "expected": 1
    },
    {
      "input": [
        5,
        [
          [
            1,
            2
          ],
          [
            0,
            2
          ],
          [
            0,
            1,
            3
          ],
          [
            2,
            4
          ],
          [
            3
          ]
        ],
        2,
        3
      ],
      "expected": 1
    },
    {
      "input": [
        5,
        [
          [
            1,
            2
          ],
          [
            0,
            2
          ],
          [
            0,
            1,
            3
          ],
          [
            2,
            4
          ],
          [
            3
          ]
        ],
        0,
        1
      ],
      "expected": 0
    }
  ],
  "count-numbers-with-unique-digits": [
    {
      "input": [
        0
      ],
      "expected": 1
    },
    {
      "input": [
        1
      ],
      "expected": 10
    },
    {
      "input": [
        3
      ],
      "expected": 739
    },
    {
      "input": [
        4
      ],
      "expected": 5275
    },
    {
      "input": [
        8
      ],
      "expected": 2345851
    }
  ],
  "combination-sum-iv": [
    {
      "input": [
        [
          9
        ],
        3
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        0
      ],
      "expected": 1
    },
    {
      "input": [
        [
          2,
          3,
          5
        ],
        8
      ],
      "expected": 6
    },
    {
      "input": [
        [
          1,
          2
        ],
        10
      ],
      "expected": 89
    }
  ],
  "multiply-strings": [
    {
      "input": [
        "0",
        "987654321"
      ],
      "expected": "0"
    },
    {
      "input": [
        "999",
        "999"
      ],
      "expected": "998001"
    },
    {
      "input": [
        "123456789",
        "987654321"
      ],
      "expected": "121932631112635269"
    },
    {
      "input": [
        "1",
        "1000000"
      ],
      "expected": "1000000"
    }
  ],
  "open-the-lock": [
    {
      "input": [
        [
          "8888"
        ],
        "0009"
      ],
      "expected": 1
    },
    {
      "input": [
        [
          "8887",
          "8889",
          "8878",
          "8898",
          "8788",
          "8988",
          "7888",
          "9888"
        ],
        "8888"
      ],
      "expected": -1
    },
    {
      "input": [
        [
          "0000"
        ],
        "8888"
      ],
      "expected": -1
    },
    {
      "input": [
        [
          "1000"
        ],
        "0000"
      ],
      "expected": 0
    }
  ],
  "kth-smallest-element-in-a-bst": [
    {
      "input": [
        [
          5,
          3,
          6,
          2,
          4,
          null,
          null,
          1
        ],
        3
      ],
      "expected": 3
    },
    {
      "input": [
        [
          1
        ],
        1
      ],
      "expected": 1
    },
    {
      "input": [
        [
          5,
          3,
          6,
          2,
          4,
          null,
          null,
          1
        ],
        6
      ],
      "expected": 6
    },
    {
      "input": [
        [
          10,
          5,
          15,
          2,
          7,
          12,
          20
        ],
        5
      ],
      "expected": 12
    }
  ],
  "keys-and-rooms": [
    {
      "input": [
        [
          [
            1,
            3
          ],
          [
            3,
            0,
            1
          ],
          [
            2
          ],
          [
            0
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          []
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            1,
            2
          ],
          [
            3
          ],
          [
            3
          ],
          []
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
            0
          ],
          [
            3
          ],
          [
            2
          ]
        ]
      ],
      "expected": false
    }
  ],
  "flatten-binary-tree-to-linked-list": [
    {
      "input": [
        []
      ],
      "expected": []
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
          1,
          2,
          3
        ]
      ],
      "expected": [
        1,
        null,
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
          null,
          3,
          null,
          4
        ]
      ],
      "expected": [
        1,
        null,
        2,
        null,
        3,
        null,
        4
      ]
    }
  ],
  "ugly-number-ii": [
    {
      "input": [
        1
      ],
      "expected": 1
    },
    {
      "input": [
        7
      ],
      "expected": 8
    },
    {
      "input": [
        15
      ],
      "expected": 24
    },
    {
      "input": [
        100
      ],
      "expected": 1536
    },
    {
      "input": [
        1690
      ],
      "expected": 2123366400
    }
  ],
  "path-sum-ii": [
    {
      "input": [
        [],
        0
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
        5
      ],
      "expected": []
    },
    {
      "input": [
        [
          1,
          2
        ],
        1
      ],
      "expected": []
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
      "expected": [
        [
          -2,
          -3
        ]
      ]
    },
    {
      "input": [
        [
          5,
          4,
          null,
          11,
          null,
          2
        ],
        22
      ],
      "expected": [
        [
          5,
          4,
          11,
          2
        ]
      ]
    }
  ],
  "can-i-win": [
    {
      "input": [
        10,
        0
      ],
      "expected": true
    },
    {
      "input": [
        10,
        1
      ],
      "expected": true
    },
    {
      "input": [
        4,
        6
      ],
      "expected": true
    },
    {
      "input": [
        5,
        50
      ],
      "expected": false
    },
    {
      "input": [
        10,
        40
      ],
      "expected": false
    }
  ],
  "3sum": [
    {
      "input": [
        [
          0,
          0,
          0
        ]
      ],
      "expected": [
        [
          0,
          0,
          0
        ]
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
      "expected": []
    },
    {
      "input": [
        [
          -2,
          0,
          2
        ]
      ],
      "expected": [
        [
          -2,
          0,
          2
        ]
      ]
    },
    {
      "input": [
        [
          -5,
          -1,
          0,
          6
        ]
      ],
      "expected": [
        [
          -5,
          -1,
          6
        ]
      ]
    }
  ],
  "maximum-length-of-repeated-subarray": [
    {
      "input": [
        [
          0,
          0,
          0,
          0,
          0
        ],
        [
          0,
          0,
          0,
          0,
          0
        ]
      ],
      "expected": 5
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
      "expected": 0
    },
    {
      "input": [
        [
          7
        ],
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
          0,
          0,
          0,
          1
        ],
        [
          1,
          0,
          0,
          1,
          1
        ]
      ],
      "expected": 3
    }
  ],
  "add-two-numbers": [
    {
      "input": [
        [
          9,
          9,
          9,
          9,
          9,
          9,
          9
        ],
        [
          9,
          9,
          9,
          9
        ]
      ],
      "expected": [
        8,
        9,
        9,
        9,
        0,
        0,
        0,
        1
      ]
    },
    {
      "input": [
        [
          5
        ],
        [
          5
        ]
      ],
      "expected": [
        0,
        1
      ]
    },
    {
      "input": [
        [
          1,
          8
        ],
        [
          0
        ]
      ],
      "expected": [
        1,
        8
      ]
    },
    {
      "input": [
        [
          9,
          9
        ],
        [
          1
        ]
      ],
      "expected": [
        0,
        0,
        1
      ]
    }
  ],
  "detect-cycle-in-undirected-graph": [
    {
      "input": [
        4,
        [
          [
            1
          ],
          [
            0,
            2
          ],
          [
            1,
            3
          ],
          [
            2
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        3,
        [
          [],
          [],
          []
        ]
      ],
      "expected": false
    },
    {
      "input": [
        6,
        [
          [
            1
          ],
          [
            0
          ],
          [
            3,
            4
          ],
          [
            2,
            4
          ],
          [
            2,
            3
          ],
          []
        ]
      ],
      "expected": true
    },
    {
      "input": [
        3,
        [
          [
            1,
            2
          ],
          [
            0,
            2
          ],
          [
            0,
            1
          ]
        ]
      ],
      "expected": true
    }
  ],
  "minimum-height-trees": [
    {
      "input": [
        1,
        []
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        3,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ]
        ]
      ],
      "expected": [
        1
      ]
    },
    {
      "input": [
        5,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ]
        ]
      ],
      "expected": [
        2
      ]
    },
    {
      "input": [
        7,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            5,
            6
          ]
        ]
      ],
      "expected": [
        3
      ]
    }
  ],
  "number-of-provinces": [
    {
      "input": [
        [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            0,
            0,
            1
          ]
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          [
            1
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            1,
            1,
            1
          ],
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
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
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
            0
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
            1
          ]
        ]
      ],
      "expected": 1
    }
  ],
  "subset-sum-problem": [
    {
      "input": [
        [
          3,
          34,
          4,
          12,
          5,
          2
        ],
        30
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        0
      ],
      "expected": true
    },
    {
      "input": [
        [
          5
        ],
        5
      ],
      "expected": true
    },
    {
      "input": [
        [
          2,
          4,
          6,
          8
        ],
        11
      ],
      "expected": false
    }
  ],
  "topological-sort": [
    {
      "input": [
        1,
        [
          []
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        3,
        [
          [
            1
          ],
          [
            2
          ],
          []
        ]
      ],
      "expected": [
        0,
        1,
        2
      ]
    },
    {
      "input": [
        5,
        [
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
          ],
          []
        ]
      ],
      "expected": [
        0,
        1,
        2,
        3,
        4
      ]
    },
    {
      "input": [
        4,
        [
          [
            2
          ],
          [
            3
          ],
          [
            1
          ],
          []
        ]
      ],
      "expected": [
        0,
        2,
        1,
        3
      ]
    }
  ],
  "bellman-ford-algorithm": [
    {
      "input": [
        2,
        [
          [
            0,
            1,
            9
          ]
        ],
        0
      ],
      "expected": [
        0,
        9
      ]
    },
    {
      "input": [
        3,
        [
          [
            0,
            1,
            1
          ],
          [
            1,
            2,
            -1
          ],
          [
            2,
            0,
            -1
          ]
        ],
        0
      ],
      "expected": [
        -1
      ]
    },
    {
      "input": [
        4,
        [
          [
            0,
            1,
            4
          ],
          [
            0,
            2,
            5
          ],
          [
            2,
            1,
            -2
          ]
        ],
        0
      ],
      "expected": [
        0,
        3,
        5,
        100000000
      ]
    },
    {
      "input": [
        3,
        [
          [
            0,
            1,
            2
          ]
        ],
        0
      ],
      "expected": [
        0,
        2,
        100000000
      ]
    }
  ],
  "insert-interval": [
    {
      "input": [
        [],
        [
          5,
          7
        ]
      ],
      "expected": [
        [
          5,
          7
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            5
          ]
        ],
        [
          2,
          3
        ]
      ],
      "expected": [
        [
          1,
          5
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            5
          ]
        ],
        [
          6,
          8
        ]
      ],
      "expected": [
        [
          1,
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
        [
          [
            3,
            5
          ],
          [
            8,
            10
          ]
        ],
        [
          1,
          2
        ]
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          3,
          5
        ],
        [
          8,
          10
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
          ],
          [
            5,
            6
          ]
        ],
        [
          0,
          10
        ]
      ],
      "expected": [
        [
          0,
          10
        ]
      ]
    }
  ],
  "construct-binary-tree-from-preorder-and-inorder-traversal": [
    {
      "input": [
        [
          -1
        ],
        [
          -1
        ]
      ],
      "expected": [
        -1
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3
        ],
        [
          3,
          2,
          1
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
          3
        ],
        [
          1,
          2,
          3
        ]
      ],
      "expected": [
        1,
        null,
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
          4,
          5,
          3,
          6,
          7
        ],
        [
          4,
          2,
          5,
          1,
          6,
          3,
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
  "palindromic-substrings": [
    {
      "input": [
        "a"
      ],
      "expected": 1
    },
    {
      "input": [
        "abba"
      ],
      "expected": 6
    },
    {
      "input": [
        "racecar"
      ],
      "expected": 10
    },
    {
      "input": [
        "aaaaa"
      ],
      "expected": 15
    }
  ],
  "generate-parentheses": [
    {
      "input": [
        2
      ],
      "expected": [
        "(())",
        "()()"
      ]
    },
    {
      "input": [
        4
      ],
      "expected": [
        "(((())))",
        "((()()))",
        "((())())",
        "((()))()",
        "(()(()))",
        "(()()())",
        "(()())()",
        "(())(())",
        "(())()()",
        "()((()))",
        "()(()())",
        "()(())()",
        "()()(())",
        "()()()()"
      ]
    },
    {
      "input": [
        5
      ],
      "expected": [
        "((((()))))",
        "(((()())))",
        "(((())()))",
        "(((()))())",
        "(((())))()",
        "((()(())))",
        "((()()()))",
        "((()())())",
        "((()()))()",
        "((())(()))",
        "((())()())",
        "((())())()",
        "((()))(())",
        "((()))()()",
        "(()((())))",
        "(()(()()))",
        "(()(())())",
        "(()(()))()",
        "(()()(()))",
        "(()()()())",
        "(()()())()",
        "(()())(())",
        "(()())()()",
        "(())((()))",
        "(())(()())",
        "(())(())()",
        "(())()(())",
        "(())()()()",
        "()(((())))",
        "()((()()))",
        "()((())())",
        "()((()))()",
        "()(()(()))",
        "()(()()())",
        "()(()())()",
        "()(())(())",
        "()(())()()",
        "()()((()))",
        "()()(()())",
        "()()(())()",
        "()()()(())",
        "()()()()()"
      ]
    },
    {
      "input": [
        6
      ],
      "expected": [
        "(((((())))))",
        "((((()()))))",
        "((((())())))",
        "((((()))()))",
        "((((())))())",
        "((((()))))()",
        "(((()(()))))",
        "(((()()())))",
        "(((()())()))",
        "(((()()))())",
        "(((()())))()",
        "(((())(())))",
        "(((())()()))",
        "(((())())())",
        "(((())()))()",
        "(((()))(()))",
        "(((()))()())",
        "(((()))())()",
        "(((())))(())",
        "(((())))()()",
        "((()((()))))",
        "((()(()())))",
        "((()(())()))",
        "((()(()))())",
        "((()(())))()",
        "((()()(())))",
        "((()()()()))",
        "((()()())())",
        "((()()()))()",
        "((()())(()))",
        "((()())()())",
        "((()())())()",
        "((()()))(())",
        "((()()))()()",
        "((())((())))",
        "((())(()()))",
        "((())(())())",
        "((())(()))()",
        "((())()(()))",
        "((())()()())",
        "((())()())()",
        "((())())(())",
        "((())())()()",
        "((()))((()))",
        "((()))(()())",
        "((()))(())()",
        "((()))()(())",
        "((()))()()()",
        "(()(((()))))",
        "(()((()())))",
        "(()((())()))",
        "(()((()))())",
        "(()((())))()",
        "(()(()(())))",
        "(()(()()()))",
        "(()(()())())",
        "(()(()()))()",
        "(()(())(()))",
        "(()(())()())",
        "(()(())())()",
        "(()(()))(())",
        "(()(()))()()",
        "(()()((())))",
        "(()()(()()))",
        "(()()(())())",
        "(()()(()))()",
        "(()()()(()))",
        "(()()()()())",
        "(()()()())()",
        "(()()())(())",
        "(()()())()()",
        "(()())((()))",
        "(()())(()())",
        "(()())(())()",
        "(()())()(())",
        "(()())()()()",
        "(())(((())))",
        "(())((()()))",
        "(())((())())",
        "(())((()))()",
        "(())(()(()))",
        "(())(()()())",
        "(())(()())()",
        "(())(())(())",
        "(())(())()()",
        "(())()((()))",
        "(())()(()())",
        "(())()(())()",
        "(())()()(())",
        "(())()()()()",
        "()((((()))))",
        "()(((()())))",
        "()(((())()))",
        "()(((()))())",
        "()(((())))()",
        "()((()(())))",
        "()((()()()))",
        "()((()())())",
        "()((()()))()",
        "()((())(()))",
        "()((())()())",
        "()((())())()",
        "()((()))(())",
        "()((()))()()",
        "()(()((())))",
        "()(()(()()))",
        "()(()(())())",
        "()(()(()))()",
        "()(()()(()))",
        "()(()()()())",
        "()(()()())()",
        "()(()())(())",
        "()(()())()()",
        "()(())((()))",
        "()(())(()())",
        "()(())(())()",
        "()(())()(())",
        "()(())()()()",
        "()()(((())))",
        "()()((()()))",
        "()()((())())",
        "()()((()))()",
        "()()(()(()))",
        "()()(()()())",
        "()()(()())()",
        "()()(())(())",
        "()()(())()()",
        "()()()((()))",
        "()()()(()())",
        "()()()(())()",
        "()()()()(())",
        "()()()()()()"
      ]
    }
  ],
  "delete-and-earn": [
    {
      "input": [
        [
          2,
          2,
          3,
          3,
          3,
          4
        ]
      ],
      "expected": 9
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
          1,
          1,
          1,
          2,
          4,
          5,
          5,
          5,
          6
        ]
      ],
      "expected": 18
    },
    {
      "input": [
        [
          8,
          10,
          4,
          9,
          1,
          3,
          5,
          9,
          4,
          10
        ]
      ],
      "expected": 37
    }
  ],
  "4c3a5c79-df8a-4335-b73f-e895b87fa20b": [
    {
      "input": [
        10,
        [
          3
        ],
        [
          3
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        100,
        [
          0,
          2,
          4
        ],
        [
          4,
          2,
          1
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        10,
        [
          6,
          8
        ],
        [
          3,
          2
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        10,
        [
          0,
          4,
          2
        ],
        [
          2,
          1,
          3
        ]
      ],
      "expected": 1
    }
  ],
  "69d3ccb2-8a3d-49c7-8c39-58c3c0eb6561": [
    {
      "input": [
        1
      ],
      "expected": [
        "()"
      ]
    },
    {
      "input": [
        2
      ],
      "expected": [
        "(())",
        "()()"
      ]
    },
    {
      "input": [
        4
      ],
      "expected": [
        "(((())))",
        "((()()))",
        "((())())",
        "((()))()",
        "(()(()))",
        "(()()())",
        "(()())()",
        "(())(())",
        "(())()()",
        "()((()))",
        "()(()())",
        "()(())()",
        "()()(())",
        "()()()()"
      ]
    },
    {
      "input": [
        5
      ],
      "expected": [
        "((((()))))",
        "(((()())))",
        "(((())()))",
        "(((()))())",
        "(((())))()",
        "((()(())))",
        "((()()()))",
        "((()())())",
        "((()()))()",
        "((())(()))",
        "((())()())",
        "((())())()",
        "((()))(())",
        "((()))()()",
        "(()((())))",
        "(()(()()))",
        "(()(())())",
        "(()(()))()",
        "(()()(()))",
        "(()()()())",
        "(()()())()",
        "(()())(())",
        "(()())()()",
        "(())((()))",
        "(())(()())",
        "(())(())()",
        "(())()(())",
        "(())()()()",
        "()(((())))",
        "()((()()))",
        "()((())())",
        "()((()))()",
        "()(()(()))",
        "()(()()())",
        "()(()())()",
        "()(())(())",
        "()(())()()",
        "()()((()))",
        "()()(()())",
        "()()(())()",
        "()()()(())",
        "()()()()()"
      ]
    }
  ],
  "triangle": [
    {
      "input": [
        [
          [
            -10
          ]
        ]
      ],
      "expected": -10
    },
    {
      "input": [
        [
          [
            -1
          ],
          [
            2,
            3
          ],
          [
            1,
            -1,
            -3
          ]
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          [
            1
          ],
          [
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
      "expected": 7
    },
    {
      "input": [
        [
          [
            5
          ],
          [
            -2,
            -3
          ],
          [
            1,
            10,
            -4
          ],
          [
            0,
            -1,
            2,
            -5
          ]
        ]
      ],
      "expected": -7
    }
  ],
  "partition-equal-subset-sum": [
    {
      "input": [
        [
          1
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          2,
          2,
          2,
          2
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          2,
          5
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          3,
          3,
          3,
          4,
          5
        ]
      ],
      "expected": true
    }
  ],
  "knight-dialer": [
    {
      "input": [
        2
      ],
      "expected": 20
    },
    {
      "input": [
        3
      ],
      "expected": 46
    },
    {
      "input": [
        4
      ],
      "expected": 104
    },
    {
      "input": [
        10
      ],
      "expected": 14912
    },
    {
      "input": [
        100
      ],
      "expected": 540641702
    }
  ],
  "lowest-common-ancestor-of-a-binary-search-tree": [
    {
      "input": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        2,
        4
      ],
      "expected": 2
    },
    {
      "input": [
        [
          2,
          1
        ],
        2,
        1
      ],
      "expected": 2
    },
    {
      "input": [
        [
          6,
          2,
          8,
          0,
          4,
          7,
          9,
          null,
          null,
          3,
          5
        ],
        3,
        5
      ],
      "expected": 4
    },
    {
      "input": [
        [
          10,
          5,
          15,
          2,
          7,
          12,
          20
        ],
        12,
        20
      ],
      "expected": 15
    }
  ],
  "guess-number-higher-or-lower-ii": [
    {
      "input": [
        1
      ],
      "expected": 0
    },
    {
      "input": [
        2
      ],
      "expected": 1
    },
    {
      "input": [
        3
      ],
      "expected": 2
    },
    {
      "input": [
        5
      ],
      "expected": 6
    },
    {
      "input": [
        16
      ],
      "expected": 34
    }
  ],
  "max-area-of-island": [
    {
      "input": [
        [
          [
            0,
            0,
            0,
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
            1
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            0,
            0,
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
            0,
            1
          ],
          [
            0,
            1,
            0
          ],
          [
            1,
            0,
            1
          ]
        ]
      ],
      "expected": 1
    }
  ],
  "swap-nodes-in-pairs": [
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
          2,
          3
        ]
      ],
      "expected": [
        2,
        1,
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
          5,
          6
        ]
      ],
      "expected": [
        2,
        1,
        4,
        3,
        6,
        5
      ]
    },
    {
      "input": [
        [
          -1,
          -2,
          -3,
          -4,
          -5
        ]
      ],
      "expected": [
        -2,
        -1,
        -4,
        -3,
        -5
      ]
    }
  ],
  "unique-paths": [
    {
      "input": [
        1,
        1
      ],
      "expected": 1
    },
    {
      "input": [
        1,
        10
      ],
      "expected": 1
    },
    {
      "input": [
        7,
        3
      ],
      "expected": 28
    },
    {
      "input": [
        10,
        10
      ],
      "expected": 48620
    }
  ],
  "number-of-longest-increasing-subsequence": [
    {
      "input": [
        [
          2,
          2,
          2,
          2,
          2
        ]
      ],
      "expected": 5
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
          4,
          3,
          5,
          4,
          7,
          2
        ]
      ],
      "expected": 3
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
      "expected": 5
    }
  ],
  "sort-list": [
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
          -1,
          5,
          3,
          4,
          0
        ]
      ],
      "expected": [
        -1,
        0,
        3,
        4,
        5
      ]
    },
    {
      "input": [
        [
          5,
          4,
          3,
          2,
          1,
          1,
          2
        ]
      ],
      "expected": [
        1,
        1,
        2,
        2,
        3,
        4,
        5
      ]
    }
  ],
  "integer-break": [
    {
      "input": [
        3
      ],
      "expected": 2
    },
    {
      "input": [
        4
      ],
      "expected": 4
    },
    {
      "input": [
        7
      ],
      "expected": 12
    },
    {
      "input": [
        15
      ],
      "expected": 243
    },
    {
      "input": [
        30
      ],
      "expected": 59049
    }
  ],
  "e748fa34-22b6-4ab6-8a97-73644137a2a9": [
    {
      "input": [
        [
          "MinStack",
          "push",
          "top",
          "getMin"
        ],
        [
          [],
          [
            5
          ],
          [],
          []
        ]
      ],
      "expected": [
        null,
        null,
        5,
        5
      ]
    },
    {
      "input": [
        [
          "MinStack",
          "push",
          "push",
          "getMin",
          "pop",
          "getMin"
        ],
        [
          [],
          [
            2
          ],
          [
            2
          ],
          [],
          [],
          []
        ]
      ],
      "expected": [
        null,
        null,
        null,
        2,
        null,
        2
      ]
    },
    {
      "input": [
        [
          "MinStack",
          "push",
          "push",
          "push",
          "pop",
          "getMin",
          "pop",
          "getMin"
        ],
        [
          [],
          [
            1
          ],
          [
            2
          ],
          [
            -5
          ],
          [],
          [],
          [],
          []
        ]
      ],
      "expected": [
        null,
        null,
        null,
        null,
        null,
        1,
        null,
        1
      ]
    },
    {
      "input": [
        [
          "MinStack",
          "push",
          "push",
          "getMin",
          "top"
        ],
        [
          [],
          [
            -100
          ],
          [
            100
          ],
          [],
          []
        ]
      ],
      "expected": [
        null,
        null,
        null,
        -100,
        100
      ]
    }
  ],
  "27c8cbf2-b010-47f4-97ac-ce718e5f1dd6": [
    {
      "input": [
        [
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            "5",
            "3",
            "4",
            "6",
            "7",
            "8",
            "9",
            "1",
            "2"
          ],
          [
            "6",
            "7",
            "2",
            "1",
            "9",
            "5",
            "3",
            "4",
            "8"
          ],
          [
            "1",
            "9",
            "8",
            "3",
            "4",
            "2",
            "5",
            "6",
            "7"
          ],
          [
            "8",
            "5",
            "9",
            "7",
            "6",
            "1",
            "4",
            "2",
            "3"
          ],
          [
            "4",
            "2",
            "6",
            "8",
            "5",
            "3",
            "7",
            "9",
            "1"
          ],
          [
            "7",
            "1",
            "3",
            "9",
            "2",
            "4",
            "8",
            "5",
            "6"
          ],
          [
            "9",
            "6",
            "1",
            "5",
            "3",
            "7",
            "2",
            "8",
            "4"
          ],
          [
            "2",
            "8",
            "7",
            "4",
            "1",
            "9",
            "6",
            "3",
            "5"
          ],
          [
            "3",
            "4",
            "5",
            "2",
            "8",
            "6",
            "1",
            "7",
            "9"
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            "5",
            "5",
            "4",
            "6",
            "7",
            "8",
            "9",
            "1",
            "2"
          ],
          [
            "6",
            "7",
            "2",
            "1",
            "9",
            "5",
            "3",
            "4",
            "8"
          ],
          [
            "1",
            "9",
            "8",
            "3",
            "4",
            "2",
            "5",
            "6",
            "7"
          ],
          [
            "8",
            "5",
            "9",
            "7",
            "6",
            "1",
            "4",
            "2",
            "3"
          ],
          [
            "4",
            "2",
            "6",
            "8",
            "5",
            "3",
            "7",
            "9",
            "1"
          ],
          [
            "7",
            "1",
            "3",
            "9",
            "2",
            "4",
            "8",
            "5",
            "6"
          ],
          [
            "9",
            "6",
            "1",
            "5",
            "3",
            "7",
            "2",
            "8",
            "4"
          ],
          [
            "2",
            "8",
            "7",
            "4",
            "1",
            "9",
            "6",
            "3",
            "5"
          ],
          [
            "3",
            "4",
            "5",
            "2",
            "8",
            "6",
            "1",
            "7",
            "9"
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            "9",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            "9",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ]
        ]
      ],
      "expected": false
    }
  ],
  "e38d2a7c-1b88-4682-bce7-627aea732946": [
    {
      "input": [
        [
          [
            1,
            4,
            7,
            11,
            15
          ],
          [
            2,
            5,
            8,
            12,
            19
          ],
          [
            3,
            6,
            9,
            16,
            22
          ]
        ],
        20
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            -5
          ]
        ],
        -5
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            -5
          ]
        ],
        -10
      ],
      "expected": false
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
          ],
          [
            7,
            8,
            9
          ]
        ],
        9
      ],
      "expected": true
    }
  ],
  "remove-duplicates-from-sorted-list-ii": [
    {
      "input": [
        []
      ],
      "expected": []
    },
    {
      "input": [
        [
          1,
          1,
          1,
          2,
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
          1,
          2,
          2
        ]
      ],
      "expected": []
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
  "split-linked-list-in-parts": [
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
        ],
        3
      ],
      "expected": [
        [
          1,
          2,
          3,
          4
        ],
        [
          5,
          6,
          7
        ],
        [
          8,
          9,
          10
        ]
      ]
    },
    {
      "input": [
        [],
        3
      ],
      "expected": [
        [],
        [],
        []
      ]
    },
    {
      "input": [
        [
          1,
          2
        ],
        1
      ],
      "expected": [
        [
          1,
          2
        ]
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4
        ],
        4
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
  "linked-list-cycle-ii": [
    {
      "input": [
        [
          1,
          2
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
        -1
      ],
      "expected": -1
    },
    {
      "input": [
        [],
        -1
      ],
      "expected": -1
    },
    {
      "input": [
        [
          10,
          20,
          30,
          40,
          50
        ],
        4
      ],
      "expected": 4
    }
  ],
  "unbounded-knapsack": [
    {
      "input": [
        [
          2,
          1
        ],
        [
          1,
          1
        ],
        3
      ],
      "expected": 3
    },
    {
      "input": [
        [
          5,
          10
        ],
        [
          10,
          30
        ],
        4
      ],
      "expected": 0
    },
    {
      "input": [
        [
          3,
          4,
          5
        ],
        [
          30,
          50,
          60
        ],
        0
      ],
      "expected": 0
    },
    {
      "input": [
        [
          2,
          3,
          5
        ],
        [
          10,
          20,
          35
        ],
        11
      ],
      "expected": 75
    }
  ],
  "redundant-connection": [
    {
      "input": [
        [
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            1,
            4
          ],
          [
            1,
            5
          ]
        ]
      ],
      "expected": [
        1,
        4
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
            1,
            3
          ],
          [
            1,
            4
          ],
          [
            3,
            4
          ]
        ]
      ],
      "expected": [
        3,
        4
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
            2,
            3
          ],
          [
            3,
            1
          ]
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
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ],
          [
            2,
            5
          ]
        ]
      ],
      "expected": [
        2,
        5
      ]
    }
  ],
  "shortest-path-in-binary-matrix": [
    {
      "input": [
        [
          [
            0
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            1
          ]
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          [
            0,
            0,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
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
            0,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            0
          ]
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          [
            0,
            0,
            0
          ],
          [
            1,
            1,
            0
          ],
          [
            1,
            1,
            1
          ]
        ]
      ],
      "expected": -1
    }
  ],
  "strongly-connected-components": [
    {
      "input": [
        3,
        [
          [
            1
          ],
          [
            2
          ],
          [
            0
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        3,
        [
          [],
          [],
          []
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        4,
        [
          [
            1
          ],
          [
            2
          ],
          [
            3
          ],
          []
        ]
      ],
      "expected": 4
    },
    {
      "input": [
        6,
        [
          [
            1
          ],
          [
            2
          ],
          [
            0,
            3
          ],
          [
            4
          ],
          [
            5
          ],
          [
            3
          ]
        ]
      ],
      "expected": 2
    }
  ],
  "last-stone-weight-ii": [
    {
      "input": [
        [
          31,
          26,
          33,
          21,
          40
        ]
      ],
      "expected": 5
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
          10,
          10
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2,
          4,
          8,
          16,
          32,
          64,
          12,
          25,
          51
        ]
      ],
      "expected": 1
    }
  ],
  "lru-cache": [
    {
      "input": [
        [
          "LRUCache",
          "put",
          "get"
        ],
        [
          [
            1
          ],
          [
            1,
            10
          ],
          [
            1
          ]
        ]
      ],
      "expected": [
        null,
        null,
        10
      ]
    },
    {
      "input": [
        [
          "LRUCache",
          "put",
          "put",
          "get",
          "get"
        ],
        [
          [
            1
          ],
          [
            1,
            1
          ],
          [
            2,
            2
          ],
          [
            1
          ],
          [
            2
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        -1,
        2
      ]
    },
    {
      "input": [
        [
          "LRUCache",
          "put",
          "put",
          "put",
          "get",
          "get"
        ],
        [
          [
            2
          ],
          [
            1,
            1
          ],
          [
            2,
            2
          ],
          [
            1,
            10
          ],
          [
            1
          ],
          [
            2
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        null,
        10,
        2
      ]
    },
    {
      "input": [
        [
          "LRUCache",
          "get",
          "put",
          "get"
        ],
        [
          [
            2
          ],
          [
            99
          ],
          [
            99,
            5
          ],
          [
            99
          ]
        ]
      ],
      "expected": [
        null,
        -1,
        null,
        5
      ]
    }
  ],
  "course-schedule-ii": [
    {
      "input": [
        1,
        []
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        2,
        [
          [
            1,
            0
          ],
          [
            0,
            1
          ]
        ]
      ],
      "expected": []
    },
    {
      "input": [
        4,
        [
          [
            1,
            0
          ],
          [
            2,
            1
          ],
          [
            3,
            2
          ]
        ]
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
        3,
        [
          [
            0,
            1
          ],
          [
            1,
            2
          ],
          [
            2,
            0
          ]
        ]
      ],
      "expected": []
    }
  ],
  "zigzag-conversion": [
    {
      "input": [
        "A",
        1
      ],
      "expected": "A"
    },
    {
      "input": [
        "ABCDEF",
        1
      ],
      "expected": "ABCDEF"
    },
    {
      "input": [
        "AB",
        5
      ],
      "expected": "AB"
    },
    {
      "input": [
        "HELLOWORLD",
        3
      ],
      "expected": "HOLELWRDLO"
    }
  ],
  "house-robber-iii": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          10
        ]
      ],
      "expected": 10
    },
    {
      "input": [
        [
          3,
          4,
          5,
          1,
          3,
          null,
          1
        ]
      ],
      "expected": 9
    },
    {
      "input": [
        [
          4,
          1,
          null,
          2,
          null,
          3
        ]
      ],
      "expected": 7
    }
  ],
  "walls-and-gates": [
    {
      "input": [
        [
          [
            -1
          ]
        ]
      ],
      "expected": [
        [
          -1
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
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            2147483647,
            -1
          ],
          [
            -1,
            0
          ]
        ]
      ],
      "expected": [
        [
          2147483647,
          -1
        ],
        [
          -1,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            0,
            2147483647,
            2147483647
          ],
          [
            2147483647,
            -1,
            2147483647
          ],
          [
            2147483647,
            2147483647,
            0
          ]
        ]
      ],
      "expected": [
        [
          0,
          1,
          2
        ],
        [
          1,
          -1,
          1
        ],
        [
          2,
          1,
          0
        ]
      ]
    }
  ],
  "longest-arithmetic-subsequence-of-given-difference": [
    {
      "input": [
        [
          1,
          3,
          5,
          7
        ],
        1
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          5,
          7,
          8,
          5,
          3,
          4,
          2,
          1
        ],
        -2
      ],
      "expected": 4
    },
    {
      "input": [
        [
          5,
          5,
          5,
          5
        ],
        0
      ],
      "expected": 4
    },
    {
      "input": [
        [
          10
        ],
        5
      ],
      "expected": 1
    }
  ],
  "delete-operation-for-two-strings": [
    {
      "input": [
        "leetcode",
        "etco"
      ],
      "expected": 4
    },
    {
      "input": [
        "abc",
        "abc"
      ],
      "expected": 0
    },
    {
      "input": [
        "abc",
        "def"
      ],
      "expected": 6
    },
    {
      "input": [
        "a",
        ""
      ],
      "expected": 1
    }
  ],
  "rotate-image": [
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
        ]
      ],
      "expected": [
        [
          3,
          1
        ],
        [
          4,
          2
        ]
      ]
    },
    {
      "input": [
        [
          [
            -1,
            -2
          ],
          [
            -3,
            -4
          ]
        ]
      ],
      "expected": [
        [
          -3,
          -1
        ],
        [
          -4,
          -2
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            0,
            0
          ],
          [
            0,
            1,
            0
          ],
          [
            0,
            0,
            1
          ]
        ]
      ],
      "expected": [
        [
          0,
          0,
          1
        ],
        [
          0,
          1,
          0
        ],
        [
          1,
          0,
          0
        ]
      ]
    }
  ],
  "design-linked-list": [
    {
      "input": [
        [
          "MyLinkedList",
          "get",
          "deleteAtIndex"
        ],
        [
          [],
          [
            0
          ],
          [
            0
          ]
        ]
      ],
      "expected": [
        null,
        -1,
        null
      ]
    },
    {
      "input": [
        [
          "MyLinkedList",
          "addAtHead",
          "addAtHead",
          "get",
          "get"
        ],
        [
          [],
          [
            2
          ],
          [
            1
          ],
          [
            0
          ],
          [
            1
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        1,
        2
      ]
    },
    {
      "input": [
        [
          "MyLinkedList",
          "addAtTail",
          "addAtTail",
          "deleteAtIndex",
          "get"
        ],
        [
          [],
          [
            10
          ],
          [
            20
          ],
          [
            0
          ],
          [
            0
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        null,
        20
      ]
    },
    {
      "input": [
        [
          "MyLinkedList",
          "addAtIndex",
          "addAtIndex",
          "get",
          "get"
        ],
        [
          [],
          [
            0,
            7
          ],
          [
            1,
            9
          ],
          [
            0
          ],
          [
            1
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        7,
        9
      ]
    }
  ],
  "combination-sum": [
    {
      "input": [
        [
          2
        ],
        1
      ],
      "expected": []
    },
    {
      "input": [
        [
          1
        ],
        1
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
          5,
          10
        ],
        3
      ],
      "expected": []
    },
    {
      "input": [
        [
          4,
          7
        ],
        7
      ],
      "expected": [
        [
          7
        ]
      ]
    }
  ],
  "validate-binary-search-tree": [
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
          2,
          2,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          5,
          4,
          6,
          null,
          null,
          3,
          7
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          -2147483648,
          null,
          2147483647
        ]
      ],
      "expected": true
    }
  ],
  "rotting-oranges": [
    {
      "input": [
        [
          [
            2,
            1,
            1
          ],
          [
            0,
            1,
            1
          ],
          [
            1,
            0,
            1
          ]
        ]
      ],
      "expected": -1
    },
    {
      "input": [
        [
          [
            0,
            2
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          [
            0,
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
            1
          ]
        ]
      ],
      "expected": -1
    }
  ],
  "maximum-product-subarray": [
    {
      "input": [
        [
          -2
        ]
      ],
      "expected": -2
    },
    {
      "input": [
        [
          -2,
          -3,
          -4
        ]
      ],
      "expected": 12
    },
    {
      "input": [
        [
          -2,
          3,
          -4
        ]
      ],
      "expected": 24
    },
    {
      "input": [
        [
          0,
          2
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          2,
          -5,
          -2,
          -4,
          3
        ]
      ],
      "expected": 24
    }
  ],
  "stone-game": [
    {
      "input": [
        [
          3,
          7,
          2,
          3
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          100
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          10,
          1,
          10,
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          4,
          5,
          6,
          7,
          8,
          9
        ]
      ],
      "expected": true
    }
  ],
  "detect-cycle-in-directed-graph": [
    {
      "input": [
        4,
        [
          [
            1
          ],
          [
            2
          ],
          [
            3
          ],
          []
        ]
      ],
      "expected": false
    },
    {
      "input": [
        2,
        [
          [
            0
          ],
          []
        ]
      ],
      "expected": true
    },
    {
      "input": [
        4,
        [
          [
            1
          ],
          [
            2
          ],
          [],
          [
            2
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        5,
        [
          [
            1
          ],
          [
            2
          ],
          [
            0
          ],
          [
            4
          ],
          []
        ]
      ],
      "expected": true
    }
  ],
  "course-schedule": [
    {
      "input": [
        2,
        [
          [
            1,
            0
          ],
          [
            0,
            1
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        1,
        []
      ],
      "expected": true
    },
    {
      "input": [
        4,
        [
          [
            1,
            0
          ],
          [
            2,
            1
          ],
          [
            3,
            2
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        4,
        [
          [
            1,
            0
          ],
          [
            2,
            1
          ],
          [
            0,
            2
          ],
          [
            3,
            2
          ]
        ]
      ],
      "expected": false
    }
  ],
  "network-delay-time": [
    {
      "input": [
        [
          [
            1,
            2,
            1
          ]
        ],
        2,
        1
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            1,
            2,
            1
          ]
        ],
        2,
        2
      ],
      "expected": -1
    },
    {
      "input": [
        [
          [
            1,
            2,
            5
          ],
          [
            1,
            3,
            1
          ],
          [
            3,
            2,
            1
          ]
        ],
        3,
        1
      ],
      "expected": 2
    },
    {
      "input": [
        [],
        1,
        1
      ],
      "expected": 0
    }
  ],
  "longest-common-substring": [
    {
      "input": [
        "ABC",
        "XYZ"
      ],
      "expected": 0
    },
    {
      "input": [
        "abcde",
        "abcde"
      ],
      "expected": 5
    },
    {
      "input": [
        "a",
        "a"
      ],
      "expected": 1
    },
    {
      "input": [
        "zxabcdezy",
        "yzabcdezx"
      ],
      "expected": 6
    }
  ],
  "perfect-squares": [
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
      "expected": 1
    },
    {
      "input": [
        7
      ],
      "expected": 4
    },
    {
      "input": [
        100
      ],
      "expected": 1
    },
    {
      "input": [
        999
      ],
      "expected": 4
    }
  ],
  "surrounded-regions": [
    {
      "input": [
        [
          [
            "X"
          ]
        ]
      ],
      "expected": [
        [
          "X"
        ]
      ]
    },
    {
      "input": [
        [
          [
            "O"
          ]
        ]
      ],
      "expected": [
        [
          "O"
        ]
      ]
    },
    {
      "input": [
        [
          [
            "X",
            "X",
            "X"
          ],
          [
            "X",
            "O",
            "X"
          ],
          [
            "X",
            "X",
            "X"
          ]
        ]
      ],
      "expected": [
        [
          "X",
          "X",
          "X"
        ],
        [
          "X",
          "X",
          "X"
        ],
        [
          "X",
          "X",
          "X"
        ]
      ]
    },
    {
      "input": [
        [
          [
            "O",
            "O"
          ],
          [
            "O",
            "O"
          ]
        ]
      ],
      "expected": [
        [
          "O",
          "O"
        ],
        [
          "O",
          "O"
        ]
      ]
    }
  ],
  "set-matrix-zeroes": [
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
          0
        ]
      ]
    },
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
            1,
            2
          ],
          [
            3,
            4
          ]
        ]
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
            0,
            3
          ]
        ]
      ],
      "expected": [
        [
          0,
          0,
          0
        ]
      ]
    }
  ],
  "1ccfb906-f92a-4dc6-b447-ad47e6a981a9": [
    {
      "input": [
        [
          "4",
          "13",
          "5",
          "/",
          "+"
        ]
      ],
      "expected": 6
    },
    {
      "input": [
        [
          "10",
          "6",
          "9",
          "3",
          "+",
          "-11",
          "*",
          "/",
          "*",
          "17",
          "+",
          "5",
          "+"
        ]
      ],
      "expected": 22
    },
    {
      "input": [
        [
          "42"
        ]
      ],
      "expected": 42
    },
    {
      "input": [
        [
          "3",
          "-4",
          "+"
        ]
      ],
      "expected": -1
    }
  ],
  "valid-sudoku": [
    {
      "input": [
        [
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            "5",
            "3",
            "4",
            "6",
            "7",
            "8",
            "9",
            "1",
            "2"
          ],
          [
            "6",
            "7",
            "2",
            "1",
            "9",
            "5",
            "3",
            "4",
            "8"
          ],
          [
            "1",
            "9",
            "8",
            "3",
            "4",
            "2",
            "5",
            "6",
            "7"
          ],
          [
            "8",
            "5",
            "9",
            "7",
            "6",
            "1",
            "4",
            "2",
            "3"
          ],
          [
            "4",
            "2",
            "6",
            "8",
            "5",
            "3",
            "7",
            "9",
            "1"
          ],
          [
            "7",
            "1",
            "3",
            "9",
            "2",
            "4",
            "8",
            "5",
            "6"
          ],
          [
            "9",
            "6",
            "1",
            "5",
            "3",
            "7",
            "2",
            "8",
            "4"
          ],
          [
            "2",
            "8",
            "7",
            "4",
            "1",
            "9",
            "6",
            "3",
            "5"
          ],
          [
            "3",
            "4",
            "5",
            "2",
            "8",
            "6",
            "1",
            "7",
            "9"
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            "5",
            "5",
            "4",
            "6",
            "7",
            "8",
            "9",
            "1",
            "2"
          ],
          [
            "6",
            "7",
            "2",
            "1",
            "9",
            "5",
            "3",
            "4",
            "8"
          ],
          [
            "1",
            "9",
            "8",
            "3",
            "4",
            "2",
            "5",
            "6",
            "7"
          ],
          [
            "8",
            "5",
            "9",
            "7",
            "6",
            "1",
            "4",
            "2",
            "3"
          ],
          [
            "4",
            "2",
            "6",
            "8",
            "5",
            "3",
            "7",
            "9",
            "1"
          ],
          [
            "7",
            "1",
            "3",
            "9",
            "2",
            "4",
            "8",
            "5",
            "6"
          ],
          [
            "9",
            "6",
            "1",
            "5",
            "3",
            "7",
            "2",
            "8",
            "4"
          ],
          [
            "2",
            "8",
            "7",
            "4",
            "1",
            "9",
            "6",
            "3",
            "5"
          ],
          [
            "3",
            "4",
            "5",
            "2",
            "8",
            "6",
            "1",
            "7",
            "9"
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            "9",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            "9",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            ".",
            "."
          ]
        ]
      ],
      "expected": false
    }
  ],
  "integer-replacement": [
    {
      "input": [
        1
      ],
      "expected": 0
    },
    {
      "input": [
        7
      ],
      "expected": 4
    },
    {
      "input": [
        4
      ],
      "expected": 2
    },
    {
      "input": [
        65535
      ],
      "expected": 17
    },
    {
      "input": [
        10000
      ],
      "expected": 16
    }
  ],
  "house-robber-ii": [
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
          200,
          3,
          140,
          20,
          10
        ]
      ],
      "expected": 340
    }
  ],
  "letter-combinations-of-a-phone-number": [
    {
      "input": [
        "2"
      ],
      "expected": [
        "a",
        "b",
        "c"
      ]
    },
    {
      "input": [
        "7"
      ],
      "expected": [
        "p",
        "q",
        "r",
        "s"
      ]
    },
    {
      "input": [
        "9"
      ],
      "expected": [
        "w",
        "x",
        "y",
        "z"
      ]
    },
    {
      "input": [
        "234"
      ],
      "expected": [
        "adg",
        "adh",
        "adi",
        "aeg",
        "aeh",
        "aei",
        "afg",
        "afh",
        "afi",
        "bdg",
        "bdh",
        "bdi",
        "beg",
        "beh",
        "bei",
        "bfg",
        "bfh",
        "bfi",
        "cdg",
        "cdh",
        "cdi",
        "ceg",
        "ceh",
        "cei",
        "cfg",
        "cfh",
        "cfi"
      ]
    }
  ],
  "longest-substring-without-repeating-characters": [
    {
      "input": [
        ""
      ],
      "expected": 0
    },
    {
      "input": [
        "pwwkew"
      ],
      "expected": 3
    },
    {
      "input": [
        "abcdef"
      ],
      "expected": 6
    },
    {
      "input": [
        "abba"
      ],
      "expected": 2
    },
    {
      "input": [
        "dvdf"
      ],
      "expected": 3
    }
  ],
  "implement-trie-prefix-tree": [
    {
      "input": [
        [
          "Trie",
          "search",
          "startsWith"
        ],
        [
          [],
          [
            "a"
          ],
          [
            "a"
          ]
        ]
      ],
      "expected": [
        null,
        false,
        false
      ]
    },
    {
      "input": [
        [
          "Trie",
          "insert",
          "search",
          "startsWith"
        ],
        [
          [],
          [
            "cat"
          ],
          [
            "ca"
          ],
          [
            "ca"
          ]
        ]
      ],
      "expected": [
        null,
        null,
        false,
        true
      ]
    },
    {
      "input": [
        [
          "Trie",
          "insert",
          "insert",
          "search",
          "search"
        ],
        [
          [],
          [
            "dog"
          ],
          [
            "dot"
          ],
          [
            "dog"
          ],
          [
            "do"
          ]
        ]
      ],
      "expected": [
        null,
        null,
        null,
        true,
        false
      ]
    },
    {
      "input": [
        [
          "Trie",
          "insert",
          "startsWith",
          "startsWith"
        ],
        [
          [],
          [
            "prefix"
          ],
          [
            "pre"
          ],
          [
            "pro"
          ]
        ]
      ],
      "expected": [
        null,
        null,
        true,
        false
      ]
    }
  ],
  "find-first-and-last-position-of-element-in-sorted-array": [
    {
      "input": [
        [],
        0
      ],
      "expected": [
        -1,
        -1
      ]
    },
    {
      "input": [
        [
          1
        ],
        1
      ],
      "expected": [
        0,
        0
      ]
    },
    {
      "input": [
        [
          2,
          2,
          2,
          2
        ],
        2
      ],
      "expected": [
        0,
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
          5
        ],
        5
      ],
      "expected": [
        4,
        4
      ]
    }
  ],
  "number-of-islands": [
    {
      "input": [
        [
          [
            "0",
            "0"
          ],
          [
            "0",
            "0"
          ]
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        [
          [
            "1"
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            "1",
            "1",
            "0",
            "0",
            "0"
          ],
          [
            "1",
            "1",
            "0",
            "0",
            "0"
          ],
          [
            "0",
            "0",
            "1",
            "0",
            "0"
          ],
          [
            "0",
            "0",
            "0",
            "1",
            "1"
          ]
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          [
            "1",
            "0",
            "1"
          ],
          [
            "0",
            "1",
            "0"
          ],
          [
            "1",
            "0",
            "1"
          ]
        ]
      ],
      "expected": 5
    }
  ],
  "minimum-ascii-delete-sum-for-two-strings": [
    {
      "input": [
        "delete",
        "leet"
      ],
      "expected": 403
    },
    {
      "input": [
        "abc",
        "abc"
      ],
      "expected": 0
    },
    {
      "input": [
        "",
        "abc"
      ],
      "expected": 294
    },
    {
      "input": [
        "a",
        "z"
      ],
      "expected": 219
    }
  ],
  "target-sum": [
    {
      "input": [
        [
          1
        ],
        1
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1
        ],
        2
      ],
      "expected": 0
    },
    {
      "input": [
        [
          0,
          0,
          0,
          0
        ],
        0
      ],
      "expected": 16
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
      "expected": 2
    }
  ],
  "dijkstra-shortest-path": [
    {
      "input": [
        3,
        [
          [
            [
              1,
              1
            ],
            [
              2,
              6
            ]
          ],
          [
            [
              2,
              3
            ],
            [
              0,
              1
            ]
          ],
          [
            [
              1,
              3
            ],
            [
              0,
              6
            ]
          ]
        ],
        2
      ],
      "expected": [
        4,
        3,
        0
      ]
    },
    {
      "input": [
        1,
        [
          []
        ],
        0
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        4,
        [
          [
            [
              1,
              4
            ],
            [
              2,
              1
            ]
          ],
          [
            [
              3,
              1
            ]
          ],
          [
            [
              1,
              2
            ],
            [
              3,
              5
            ]
          ],
          []
        ],
        0
      ],
      "expected": [
        0,
        3,
        1,
        4
      ]
    },
    {
      "input": [
        4,
        [
          [
            [
              1,
              2
            ],
            [
              2,
              5
            ]
          ],
          [
            [
              2,
              1
            ],
            [
              3,
              7
            ]
          ],
          [
            [
              3,
              2
            ]
          ],
          []
        ],
        0
      ],
      "expected": [
        0,
        2,
        3,
        5
      ]
    }
  ],
  "bipartite-graph-bfs": [
    {
      "input": [
        3,
        [
          [
            1,
            2
          ],
          [
            0,
            2
          ],
          [
            0,
            1
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        1,
        [
          []
        ]
      ],
      "expected": true
    },
    {
      "input": [
        4,
        [
          [
            1,
            3
          ],
          [
            0,
            2
          ],
          [
            1,
            3
          ],
          [
            0,
            2
          ]
        ]
      ],
      "expected": true
    },
    {
      "input": [
        5,
        [
          [
            1
          ],
          [
            0
          ],
          [
            3,
            4
          ],
          [
            2,
            4
          ],
          [
            2,
            3
          ]
        ]
      ],
      "expected": false
    }
  ],
  "binary-tree-right-side-view": [
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
          null,
          3
        ]
      ],
      "expected": [
        1,
        3
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
        3,
        4
      ]
    }
  ],
  "divide-two-integers": [
    {
      "input": [
        0,
        1
      ],
      "expected": 0
    },
    {
      "input": [
        -2147483648,
        -1
      ],
      "expected": 2147483647
    },
    {
      "input": [
        -2147483648,
        1
      ],
      "expected": -2147483648
    },
    {
      "input": [
        -15,
        4
      ],
      "expected": -3
    },
    {
      "input": [
        100,
        10
      ],
      "expected": 10
    }
  ],
  "path-sum-iii": [
    {
      "input": [
        [],
        0
      ],
      "expected": 0
    },
    {
      "input": [
        [
          5,
          4,
          8,
          11,
          null,
          13,
          4,
          7,
          2,
          null,
          null,
          5,
          1
        ],
        22
      ],
      "expected": 3
    },
    {
      "input": [
        [
          1,
          -2,
          -3
        ],
        -1
      ],
      "expected": 1
    },
    {
      "input": [
        [
          0,
          1,
          1
        ],
        1
      ],
      "expected": 4
    }
  ],
  "longest-palindromic-substring": [
    {
      "input": [
        "a"
      ],
      "expected": "a"
    },
    {
      "input": [
        "racecar"
      ],
      "expected": "racecar"
    },
    {
      "input": [
        "xyzabccba123"
      ],
      "expected": "abccba"
    },
    {
      "input": [
        "forgeeksskeegfor"
      ],
      "expected": "geeksskeeg"
    }
  ],
  "spiral-matrix-ii": [
    {
      "input": [
        2
      ],
      "expected": [
        [
          1,
          2
        ],
        [
          4,
          3
        ]
      ]
    },
    {
      "input": [
        4
      ],
      "expected": [
        [
          1,
          2,
          3,
          4
        ],
        [
          12,
          13,
          14,
          5
        ],
        [
          11,
          16,
          15,
          6
        ],
        [
          10,
          9,
          8,
          7
        ]
      ]
    },
    {
      "input": [
        5
      ],
      "expected": [
        [
          1,
          2,
          3,
          4,
          5
        ],
        [
          16,
          17,
          18,
          19,
          6
        ],
        [
          15,
          24,
          25,
          20,
          7
        ],
        [
          14,
          23,
          22,
          21,
          8
        ],
        [
          13,
          12,
          11,
          10,
          9
        ]
      ]
    },
    {
      "input": [
        6
      ],
      "expected": [
        [
          1,
          2,
          3,
          4,
          5,
          6
        ],
        [
          20,
          21,
          22,
          23,
          24,
          7
        ],
        [
          19,
          32,
          33,
          34,
          25,
          8
        ],
        [
          18,
          31,
          36,
          35,
          26,
          9
        ],
        [
          17,
          30,
          29,
          28,
          27,
          10
        ],
        [
          16,
          15,
          14,
          13,
          12,
          11
        ]
      ]
    }
  ],
  "jump-game": [
    {
      "input": [
        [
          0
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          2,
          0,
          0
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          1,
          1,
          0
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          0,
          2,
          3
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          1,
          0,
          1,
          0
        ]
      ],
      "expected": false
    }
  ],
  "cheapest-flights-within-k-stops": [
    {
      "input": [
        3,
        [
          [
            0,
            1,
            100
          ],
          [
            1,
            2,
            100
          ],
          [
            0,
            2,
            500
          ]
        ],
        0,
        2,
        0
      ],
      "expected": 500
    },
    {
      "input": [
        4,
        [
          [
            0,
            1,
            100
          ],
          [
            1,
            2,
            100
          ],
          [
            2,
            0,
            100
          ],
          [
            1,
            3,
            600
          ],
          [
            2,
            3,
            200
          ]
        ],
        0,
        3,
        1
      ],
      "expected": 700
    },
    {
      "input": [
        3,
        [
          [
            0,
            1,
            100
          ]
        ],
        0,
        2,
        1
      ],
      "expected": -1
    },
    {
      "input": [
        4,
        [
          [
            0,
            1,
            1
          ],
          [
            0,
            2,
            5
          ],
          [
            1,
            2,
            1
          ],
          [
            2,
            3,
            1
          ]
        ],
        0,
        3,
        1
      ],
      "expected": 6
    }
  ],
  "two-sum-ii": [
    {
      "input": [
        [
          2,
          3,
          4
        ],
        6
      ],
      "expected": [
        1,
        3
      ]
    },
    {
      "input": [
        [
          -1,
          0
        ],
        -1
      ],
      "expected": [
        1,
        2
      ]
    },
    {
      "input": [
        [
          -10,
          -3,
          0,
          4,
          9
        ],
        1
      ],
      "expected": [
        2,
        4
      ]
    },
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          4,
          9,
          56,
          90
        ],
        8
      ],
      "expected": [
        4,
        5
      ]
    }
  ],
  "snakes-and-ladders": [
    {
      "input": [
        [
          [
            -1,
            -1
          ],
          [
            -1,
            3
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            -1,
            -1,
            -1
          ],
          [
            -1,
            9,
            8
          ],
          [
            -1,
            8,
            9
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            -1,
            -1,
            -1,
            -1
          ],
          [
            -1,
            -1,
            -1,
            -1
          ],
          [
            -1,
            -1,
            -1,
            -1
          ],
          [
            -1,
            16,
            -1,
            -1
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            -1,
            1,
            1,
            1
          ],
          [
            -1,
            7,
            1,
            1
          ],
          [
            16,
            1,
            1,
            1
          ],
          [
            -1,
            1,
            9,
            2
          ]
        ]
      ],
      "expected": 2
    }
  ],
  "minimum-falling-path-sum": [
    {
      "input": [
        [
          [
            -19,
            57
          ],
          [
            -40,
            -5
          ]
        ]
      ],
      "expected": -59
    },
    {
      "input": [
        [
          [
            -48
          ]
        ]
      ],
      "expected": -48
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
          ],
          [
            7,
            8,
            9
          ]
        ]
      ],
      "expected": 12
    },
    {
      "input": [
        [
          [
            100,
            -42,
            -46,
            -41
          ],
          [
            31,
            97,
            10,
            -10
          ],
          [
            -58,
            -51,
            82,
            89
          ],
          [
            51,
            81,
            69,
            -51
          ]
        ]
      ],
      "expected": -36
    }
  ],
  "word-search": [
    {
      "input": [
        [
          [
            "A",
            "B",
            "C",
            "E"
          ],
          [
            "S",
            "F",
            "C",
            "S"
          ],
          [
            "A",
            "D",
            "E",
            "E"
          ]
        ],
        "ABCB"
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            "a"
          ]
        ],
        "a"
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            "a"
          ]
        ],
        "b"
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            "a",
            "b"
          ],
          [
            "c",
            "d"
          ]
        ],
        "acdb"
      ],
      "expected": true
    }
  ],
  "arithmetic-slices": [
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
      "expected": 0
    },
    {
      "input": [
        [
          1,
          2,
          3,
          8,
          9,
          10
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          7,
          7,
          7,
          7,
          7
        ]
      ],
      "expected": 6
    },
    {
      "input": [
        [
          1,
          3,
          5,
          7,
          9,
          15,
          20,
          25
        ]
      ],
      "expected": 7
    }
  ],
  "sort-colors": [
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
          2,
          2,
          1,
          1,
          0,
          0
        ]
      ],
      "expected": [
        0,
        0,
        1,
        1,
        2,
        2
      ]
    },
    {
      "input": [
        [
          1,
          1,
          1
        ]
      ],
      "expected": [
        1,
        1,
        1
      ]
    },
    {
      "input": [
        [
          0,
          2,
          1,
          0,
          2,
          1,
          0
        ]
      ],
      "expected": [
        0,
        0,
        0,
        1,
        1,
        2,
        2
      ]
    }
  ],
  "hamiltonian-path": [
    {
      "input": [
        4,
        3,
        [
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            2,
            4
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        1,
        0,
        []
      ],
      "expected": true
    },
    {
      "input": [
        4,
        2,
        [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ]
      ],
      "expected": false
    },
    {
      "input": [
        5,
        4,
        [
          [
            1,
            2
          ],
          [
            2,
            3
          ],
          [
            3,
            4
          ],
          [
            4,
            5
          ]
        ]
      ],
      "expected": true
    }
  ],
  "longest-increasing-subsequence": [
    {
      "input": [
        [
          7,
          7,
          7,
          7,
          7
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
          -10,
          -5,
          0,
          5,
          10
        ]
      ],
      "expected": 5
    }
  ],
  "decode-ways": [
    {
      "input": [
        "06"
      ],
      "expected": 0
    },
    {
      "input": [
        "10"
      ],
      "expected": 1
    },
    {
      "input": [
        "2101"
      ],
      "expected": 1
    },
    {
      "input": [
        "1111111111"
      ],
      "expected": 89
    },
    {
      "input": [
        "27"
      ],
      "expected": 1
    }
  ],
  "search-in-rotated-sorted-array-ii": [
    {
      "input": [
        [
          1,
          0,
          1,
          1,
          1
        ],
        0
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          1,
          1,
          1,
          1
        ],
        2
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
          3,
          1
        ],
        1
      ],
      "expected": true
    }
  ],
  "4d9b945b-f679-4a29-b6ca-0fc7524cea1a": [
    {
      "input": [
        [
          30,
          40,
          50,
          60
        ]
      ],
      "expected": [
        1,
        1,
        1,
        0
      ]
    },
    {
      "input": [
        [
          30,
          60,
          90
        ]
      ],
      "expected": [
        1,
        1,
        0
      ]
    },
    {
      "input": [
        [
          90,
          80,
          70,
          60
        ]
      ],
      "expected": [
        0,
        0,
        0,
        0
      ]
    },
    {
      "input": [
        [
          50
        ]
      ],
      "expected": [
        0
      ]
    }
  ],
  "next-permutation": [
    {
      "input": [
        [
          1,
          1,
          5
        ]
      ],
      "expected": [
        1,
        5,
        1
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
          1,
          3,
          2
        ]
      ],
      "expected": [
        2,
        1,
        3
      ]
    },
    {
      "input": [
        [
          2,
          3,
          1,
          3,
          3
        ]
      ],
      "expected": [
        2,
        3,
        3,
        1,
        3
      ]
    }
  ],
  "search-a-2d-matrix": [
    {
      "input": [
        [
          [
            1
          ]
        ],
        1
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            1
          ]
        ],
        0
      ],
      "expected": false
    },
    {
      "input": [
        [
          [
            1,
            3,
            5,
            7
          ],
          [
            10,
            11,
            16,
            20
          ],
          [
            23,
            30,
            34,
            60
          ]
        ],
        60
      ],
      "expected": true
    },
    {
      "input": [
        [
          [
            1,
            3,
            5,
            7
          ],
          [
            10,
            11,
            16,
            20
          ],
          [
            23,
            30,
            34,
            60
          ]
        ],
        1
      ],
      "expected": true
    }
  ],
  "predict-the-winner": [
    {
      "input": [
        [
          1,
          5,
          233,
          7
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          0
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          1,
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          2,
          4,
          55,
          6,
          8
        ]
      ],
      "expected": false
    }
  ],
  "combination-sum-ii": [
    {
      "input": [
        [
          2,
          2,
          2
        ],
        1
      ],
      "expected": []
    },
    {
      "input": [
        [
          5
        ],
        5
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
          1,
          1,
          1
        ],
        2
      ],
      "expected": [
        [
          1,
          1
        ]
      ]
    },
    {
      "input": [
        [
          3,
          4,
          5
        ],
        12
      ],
      "expected": [
        [
          3,
          4,
          5
        ]
      ]
    }
  ],
  "find-all-anagrams-in-a-string": [
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
    },
    {
      "input": [
        "baa",
        "aa"
      ],
      "expected": [
        1
      ]
    }
  ],
  "find-and-replace-pattern": [
    {
      "input": [
        [
          "abc",
          "cba",
          "xyx",
          "yxx",
          "yyx"
        ],
        "abc"
      ],
      "expected": [
        "abc",
        "cba"
      ]
    },
    {
      "input": [
        [
          "badc",
          "abab",
          "dddd",
          "dede",
          "yyxx"
        ],
        "baba"
      ],
      "expected": [
        "abab",
        "dede"
      ]
    },
    {
      "input": [
        [
          "a"
        ],
        "z"
      ],
      "expected": [
        "a"
      ]
    },
    {
      "input": [
        [
          "ab",
          "cd",
          "ee"
        ],
        "xx"
      ],
      "expected": [
        "ee"
      ]
    }
  ],
  "longest-word-in-dictionary-through-deleting": [
    {
      "input": [
        "abpcplea",
        [
          "xyz",
          "mno"
        ]
      ],
      "expected": ""
    },
    {
      "input": [
        "bab",
        [
          "ba",
          "ab",
          "a",
          "b"
        ]
      ],
      "expected": "ab"
    },
    {
      "input": [
        "aaa",
        [
          "aaa",
          "aa",
          "a"
        ]
      ],
      "expected": "aaa"
    },
    {
      "input": [
        "aewfafwafjlwajflwajflwafj",
        [
          "apple",
          "ewaf",
          "awefawfwaf",
          "awef",
          "awefe",
          "ewafeffewafewf"
        ]
      ],
      "expected": "ewaf"
    }
  ],
  "find-all-anagrams": [
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
    },
    {
      "input": [
        "baa",
        "aa"
      ],
      "expected": [
        1
      ]
    }
  ],
  "minimum-operations-to-make-array-equal": [
    {
      "input": [
        1
      ],
      "expected": 0
    },
    {
      "input": [
        2
      ],
      "expected": 1
    },
    {
      "input": [
        4
      ],
      "expected": 4
    },
    {
      "input": [
        5
      ],
      "expected": 6
    },
    {
      "input": [
        100
      ],
      "expected": 2500
    }
  ],
  "minimum-number-of-operations-to-reinitialize-permutation": [
    {
      "input": [
        4
      ],
      "expected": 2
    },
    {
      "input": [
        8
      ],
      "expected": 3
    },
    {
      "input": [
        10
      ],
      "expected": 6
    },
    {
      "input": [
        16
      ],
      "expected": 4
    }
  ],
  "minimum-length-of-string-after-deleting-similar-ends": [
    {
      "input": [
        "aabccabba"
      ],
      "expected": 3
    },
    {
      "input": [
        "a"
      ],
      "expected": 1
    },
    {
      "input": [
        "aaaa"
      ],
      "expected": 0
    },
    {
      "input": [
        "ab"
      ],
      "expected": 2
    },
    {
      "input": [
        "bbbbbbbbbbbbbbbbbbbbbbbbbbbabbbbbbbbbbbbbbbccbcbcbccbbabbb"
      ],
      "expected": 1
    }
  ],
  "longest-consecutive-sequence": [
    {
      "input": [
        []
      ],
      "expected": 0
    },
    {
      "input": [
        [
          42
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          1,
          2,
          0,
          1
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          -5,
          -4,
          -3,
          10,
          11,
          -2,
          -1
        ]
      ],
      "expected": 5
    }
  ],
  "coin-change-2": [
    {
      "input": [
        0,
        [
          7
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        10,
        [
          10
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        10,
        [
          2,
          5,
          3,
          6
        ]
      ],
      "expected": 5
    },
    {
      "input": [
        100,
        [
          1,
          2,
          5
        ]
      ],
      "expected": 541
    }
  ]
};
