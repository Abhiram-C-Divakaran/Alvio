import type { ProblemTestCase } from '../submissionRunner';

/**
 * Phase 7 curated server-only hidden test cases for Hard problems (43 problems, 184 cases).
 * Every expected value is independently verified against tests/oracles/hard.ts.
 */
export const PHASE7_HARD_HIDDEN_TESTS: Readonly<Record<string, readonly ProblemTestCase[]>> = {
  "substring-with-concatenation-of-all-words": [
    {
      "input": [
        "barfoofoobarthefoobarman",
        [
          "bar",
          "foo",
          "the"
        ]
      ],
      "expected": [
        6,
        9,
        12
      ]
    },
    {
      "input": [
        "aaaaaa",
        [
          "aa",
          "aa",
          "aa"
        ]
      ],
      "expected": [
        0
      ]
    },
    {
      "input": [
        "abcdef",
        [
          "gh",
          "ij"
        ]
      ],
      "expected": []
    },
    {
      "input": [
        "xyfoobaz",
        [
          "foo"
        ]
      ],
      "expected": [
        2
      ]
    }
  ],
  "lfu-cache": [
    {
      "input": [
        [
          "LFUCache",
          "put",
          "get"
        ],
        [
          [
            0
          ],
          [
            0,
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
        -1
      ]
    },
    {
      "input": [
        [
          "LFUCache",
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
            10
          ],
          [
            2,
            20
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
        20
      ]
    },
    {
      "input": [
        [
          "LFUCache",
          "put",
          "put",
          "get",
          "get",
          "put",
          "get",
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
            2
          ],
          [
            2
          ],
          [
            3,
            3
          ],
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
        null,
        null,
        null,
        2,
        2,
        null,
        -1,
        2,
        3
      ]
    },
    {
      "input": [
        [
          "LFUCache",
          "put",
          "put",
          "put",
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
            1,
            100
          ],
          [
            2,
            2
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
        null,
        100
      ]
    }
  ],
  "text-justification": [
    {
      "input": [
        [
          "What",
          "must",
          "be",
          "acknowledgment",
          "shall",
          "be"
        ],
        16
      ],
      "expected": [
        "What   must   be",
        "acknowledgment  ",
        "shall be        "
      ]
    },
    {
      "input": [
        [
          "Science",
          "is",
          "what",
          "we",
          "understand",
          "well",
          "enough",
          "to",
          "explain",
          "to",
          "a",
          "computer.",
          "Art",
          "is",
          "everything",
          "else",
          "we",
          "do"
        ],
        20
      ],
      "expected": [
        "Science  is  what we",
        "understand      well",
        "enough to explain to",
        "a  computer.  Art is",
        "everything  else  we",
        "do                  "
      ]
    },
    {
      "input": [
        [
          "Single"
        ],
        10
      ],
      "expected": [
        "Single    "
      ]
    },
    {
      "input": [
        [
          "a",
          "b",
          "c",
          "d"
        ],
        3
      ],
      "expected": [
        "a b",
        "c d"
      ]
    }
  ],
  "distinct-subsequences-ii": [
    {
      "input": [
        "a"
      ],
      "expected": 1
    },
    {
      "input": [
        "aba"
      ],
      "expected": 6
    },
    {
      "input": [
        "aaa"
      ],
      "expected": 3
    },
    {
      "input": [
        "zchmliaqdgvwncfatcfivphddpzjkgyygueikthqzyeeiebczqbqhdjtkoawkehkbizdmcnilcjjlpoeoqqoqpswtqdpvszfaksn"
      ],
      "expected": 726271465
    }
  ],
  "longest-increasing-path-in-a-matrix": [
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
            7,
            7,
            5
          ],
          [
            2,
            4,
            6
          ],
          [
            8,
            2,
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
            2,
            3,
            4
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
            2,
            3
          ],
          [
            8,
            9,
            4
          ],
          [
            7,
            6,
            5
          ]
        ]
      ],
      "expected": 9
    }
  ],
  "valid-number": [
    {
      "input": [
        "2"
      ],
      "expected": true
    },
    {
      "input": [
        "-90E3"
      ],
      "expected": true
    },
    {
      "input": [
        "99e2.5"
      ],
      "expected": false
    },
    {
      "input": [
        "--6"
      ],
      "expected": false
    },
    {
      "input": [
        "53.5e93"
      ],
      "expected": true
    },
    {
      "input": [
        "inf"
      ],
      "expected": false
    }
  ],
  "count-of-smaller-numbers-after-self": [
    {
      "input": [
        [
          -1,
          -1
        ]
      ],
      "expected": [
        0,
        0
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
          5,
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
        1,
        0
      ]
    },
    {
      "input": [
        [
          26,
          78,
          27,
          100,
          33,
          67,
          90,
          23,
          66,
          5,
          38,
          7,
          35,
          23,
          52,
          22,
          83,
          51,
          98,
          69
        ]
      ],
      "expected": [
        5,
        14,
        5,
        16,
        5,
        10,
        12,
        3,
        8,
        0,
        4,
        0,
        2,
        1,
        2,
        0,
        2,
        0,
        1,
        0
      ]
    }
  ],
  "russian-doll-envelopes": [
    {
      "input": [
        [
          [
            2,
            100
          ],
          [
            3,
            200
          ],
          [
            4,
            300
          ],
          [
            5,
            500
          ],
          [
            5,
            400
          ],
          [
            5,
            250
          ],
          [
            6,
            370
          ],
          [
            6,
            360
          ],
          [
            7,
            380
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
            4,
            5
          ],
          [
            4,
            6
          ],
          [
            6,
            7
          ],
          [
            2,
            3
          ],
          [
            1,
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
            3
          ],
          [
            3,
            5
          ],
          [
            6,
            7
          ],
          [
            6,
            8
          ],
          [
            8,
            4
          ],
          [
            9,
            5
          ]
        ]
      ],
      "expected": 3
    }
  ],
  "best-time-to-buy-and-sell-stock-iv": [
    {
      "input": [
        0,
        [
          1,
          3,
          5
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        2,
        []
      ],
      "expected": 0
    },
    {
      "input": [
        10,
        [
          1,
          2,
          4,
          2,
          5,
          7,
          2,
          4,
          9,
          0
        ]
      ],
      "expected": 15
    },
    {
      "input": [
        3,
        [
          7,
          6,
          4,
          3,
          1
        ]
      ],
      "expected": 0
    }
  ],
  "regular-expression-matching": [
    {
      "input": [
        "aab",
        "c*a*b"
      ],
      "expected": true
    },
    {
      "input": [
        "mississippi",
        "mis*is*p*."
      ],
      "expected": false
    },
    {
      "input": [
        "",
        "a*b*"
      ],
      "expected": true
    },
    {
      "input": [
        "aaa",
        "a*a"
      ],
      "expected": true
    },
    {
      "input": [
        "abcd",
        "d*"
      ],
      "expected": false
    }
  ],
  "basic-calculator": [
    {
      "input": [
        "0"
      ],
      "expected": 0
    },
    {
      "input": [
        "-2+ 1"
      ],
      "expected": -1
    },
    {
      "input": [
        "(1-(3-4))"
      ],
      "expected": 2
    },
    {
      "input": [
        "2147483647"
      ],
      "expected": 2147483647
    },
    {
      "input": [
        "-(3 + (4 + 5))"
      ],
      "expected": -12
    }
  ],
  "maximal-rectangle": [
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
          ]
        ]
      ],
      "expected": 6
    },
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
    }
  ],
  "frog-jump": [
    {
      "input": [
        [
          0,
          1
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          0,
          2
        ]
      ],
      "expected": false
    },
    {
      "input": [
        [
          0,
          1,
          3,
          6,
          10,
          15,
          16,
          21
        ]
      ],
      "expected": true
    },
    {
      "input": [
        [
          0,
          1,
          3,
          6,
          7
        ]
      ],
      "expected": false
    }
  ],
  "reconstruct-itinerary": [
    {
      "input": [
        [
          [
            "JFK",
            "SFO"
          ],
          [
            "JFK",
            "ATL"
          ],
          [
            "SFO",
            "ATL"
          ],
          [
            "ATL",
            "JFK"
          ],
          [
            "ATL",
            "SFO"
          ]
        ]
      ],
      "expected": [
        "JFK",
        "ATL",
        "JFK",
        "SFO",
        "ATL",
        "SFO"
      ]
    },
    {
      "input": [
        [
          [
            "JFK",
            "KUL"
          ],
          [
            "JFK",
            "NRT"
          ],
          [
            "NRT",
            "JFK"
          ]
        ]
      ],
      "expected": [
        "JFK",
        "NRT",
        "JFK",
        "KUL"
      ]
    },
    {
      "input": [
        [
          [
            "JFK",
            "AAA"
          ]
        ]
      ],
      "expected": [
        "JFK",
        "AAA"
      ]
    },
    {
      "input": [
        [
          [
            "JFK",
            "BBB"
          ],
          [
            "BBB",
            "CCC"
          ],
          [
            "CCC",
            "JFK"
          ],
          [
            "JFK",
            "AAA"
          ]
        ]
      ],
      "expected": [
        "JFK",
        "BBB",
        "CCC",
        "JFK",
        "AAA"
      ]
    }
  ],
  "dungeon-game": [
    {
      "input": [
        [
          [
            100
          ]
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          [
            -5
          ]
        ]
      ],
      "expected": 6
    },
    {
      "input": [
        [
          [
            1,
            -3,
            3
          ],
          [
            0,
            -2,
            0
          ],
          [
            -3,
            -3,
            -3
          ]
        ]
      ],
      "expected": 3
    },
    {
      "input": [
        [
          [
            -2,
            -3,
            -1
          ]
        ]
      ],
      "expected": 7
    }
  ],
  "split-array-largest-sum": [
    {
      "input": [
        [
          1,
          4,
          4
        ],
        3
      ],
      "expected": 4
    },
    {
      "input": [
        [
          10
        ],
        1
      ],
      "expected": 10
    },
    {
      "input": [
        [
          0,
          0,
          0,
          0
        ],
        2
      ],
      "expected": 0
    },
    {
      "input": [
        [
          2,
          3,
          1,
          2,
          4,
          3
        ],
        5
      ],
      "expected": 4
    }
  ],
  "best-time-to-buy-and-sell-stock-iii": [
    {
      "input": [
        [
          7,
          6,
          4,
          3,
          1
        ]
      ],
      "expected": 0
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
          4,
          2,
          5,
          7,
          2,
          4,
          9,
          0
        ]
      ],
      "expected": 13
    },
    {
      "input": [
        [
          2,
          1,
          2,
          0,
          1
        ]
      ],
      "expected": 2
    }
  ],
  "word-ladder": [
    {
      "input": [
        "hit",
        "cog",
        [
          "hot",
          "dot",
          "dog",
          "lot",
          "log"
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        "a",
        "c",
        [
          "a",
          "b",
          "c"
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        "hot",
        "dog",
        [
          "hot",
          "dog"
        ]
      ],
      "expected": 0
    },
    {
      "input": [
        "ymain",
        "oecij",
        [
          "ymann",
          "yycrj",
          "oecij",
          "ymcnj",
          "yzcrj",
          "yycij",
          "xecij",
          "yecij",
          "ymanj",
          "yzcnj",
          "ymain"
        ]
      ],
      "expected": 10
    }
  ],
  "max-sum-of-rectangle-no-larger-than-k": [
    {
      "input": [
        [
          [
            -1
          ]
        ],
        -1
      ],
      "expected": -1
    },
    {
      "input": [
        [
          [
            5,
            -4,
            -3,
            4
          ],
          [
            -3,
            -4,
            4,
            5
          ],
          [
            5,
            1,
            5,
            -4
          ]
        ],
        8
      ],
      "expected": 8
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
        10
      ],
      "expected": 10
    },
    {
      "input": [
        [
          [
            2,
            2,
            -1
          ]
        ],
        0
      ],
      "expected": -1
    }
  ],
  "reverse-nodes-in-k-group": [
    {
      "input": [
        [
          1,
          2,
          3,
          4,
          5
        ],
        1
      ],
      "expected": [
        1,
        2,
        3,
        4,
        5
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
        1
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
          5,
          6
        ],
        2
      ],
      "expected": [
        2,
        1,
        4,
        3,
        6,
        5
      ]
    }
  ],
  "first-missing-positive": [
    {
      "input": [
        [
          1
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          -1,
          -2,
          -3
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
          4,
          5
        ]
      ],
      "expected": 6
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
      "expected": 1
    },
    {
      "input": [
        [
          0,
          2,
          2,
          1,
          1
        ]
      ],
      "expected": 3
    }
  ],
  "alien-dictionary": [
    {
      "input": [
        [
          "z",
          "x"
        ]
      ],
      "expected": "zx"
    },
    {
      "input": [
        [
          "z",
          "x",
          "z"
        ]
      ],
      "expected": ""
    },
    {
      "input": [
        [
          "abc",
          "ab"
        ]
      ],
      "expected": ""
    },
    {
      "input": [
        [
          "a",
          "b",
          "c",
          "d"
        ]
      ],
      "expected": "abcd"
    }
  ],
  "0-1-knapsack": [
    {
      "input": [
        [
          4,
          5,
          1
        ],
        [
          1,
          2,
          3
        ],
        4
      ],
      "expected": 3
    },
    {
      "input": [
        [
          4,
          5,
          6
        ],
        [
          1,
          2,
          3
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
        [
          10,
          15,
          40
        ],
        6
      ],
      "expected": 65
    },
    {
      "input": [
        [
          2,
          3,
          4,
          5
        ],
        [
          3,
          4,
          5,
          6
        ],
        5
      ],
      "expected": 7
    }
  ],
  "wildcard-matching": [
    {
      "input": [
        "adceb",
        "*a*b"
      ],
      "expected": true
    },
    {
      "input": [
        "acdcb",
        "a*c?b"
      ],
      "expected": false
    },
    {
      "input": [
        "",
        "*"
      ],
      "expected": true
    },
    {
      "input": [
        "",
        "?"
      ],
      "expected": false
    },
    {
      "input": [
        "abcdef",
        "a*d*f"
      ],
      "expected": true
    }
  ],
  "recover-binary-search-tree": [
    {
      "input": [
        [
          2,
          3,
          1
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
          2,
          null,
          1
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
          5,
          3,
          9,
          -2147483648,
          2
        ]
      ],
      "expected": [
        5,
        2,
        9,
        -2147483648,
        3
      ]
    }
  ],
  "strong-password-checker": [
    {
      "input": [
        "aaa111"
      ],
      "expected": 2
    },
    {
      "input": [
        "aaaaaa"
      ],
      "expected": 2
    },
    {
      "input": [
        "bbaaaaaaaaaaaaaaacccccc"
      ],
      "expected": 8
    },
    {
      "input": [
        "1111111111"
      ],
      "expected": 3
    },
    {
      "input": [
        "ABABABABABABABABABAB1"
      ],
      "expected": 2
    }
  ],
  "find-minimum-in-rotated-sorted-array-ii": [
    {
      "input": [
        [
          3,
          3,
          1,
          3
        ]
      ],
      "expected": 1
    },
    {
      "input": [
        [
          10,
          1,
          10,
          10,
          10
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
          2,
          2,
          2,
          2,
          2
        ]
      ],
      "expected": 2
    }
  ],
  "burst-balloons": [
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
          2,
          3
        ]
      ],
      "expected": 12
    },
    {
      "input": [
        [
          9,
          76,
          64,
          21
        ]
      ],
      "expected": 116718
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
    }
  ],
  "largest-rectangle-in-histogram": [
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
          5
        ]
      ],
      "expected": 9
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
      "expected": 9
    },
    {
      "input": [
        [
          2,
          1,
          2
        ]
      ],
      "expected": 3
    }
  ],
  "the-skyline-problem": [
    {
      "input": [
        [
          [
            0,
            2,
            3
          ],
          [
            2,
            5,
            3
          ]
        ]
      ],
      "expected": [
        [
          0,
          3
        ],
        [
          5,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            5,
            10
          ]
        ]
      ],
      "expected": [
        [
          1,
          10
        ],
        [
          5,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            3,
            5
          ],
          [
            4,
            6,
            5
          ]
        ]
      ],
      "expected": [
        [
          1,
          5
        ],
        [
          3,
          0
        ],
        [
          4,
          5
        ],
        [
          6,
          0
        ]
      ]
    },
    {
      "input": [
        [
          [
            1,
            10,
            5
          ],
          [
            2,
            9,
            8
          ],
          [
            3,
            8,
            12
          ]
        ]
      ],
      "expected": [
        [
          1,
          5
        ],
        [
          2,
          8
        ],
        [
          3,
          12
        ],
        [
          8,
          8
        ],
        [
          9,
          5
        ],
        [
          10,
          0
        ]
      ]
    }
  ],
  "k-inverse-pairs-array": [
    {
      "input": [
        3,
        1
      ],
      "expected": 2
    },
    {
      "input": [
        3,
        2
      ],
      "expected": 2
    },
    {
      "input": [
        3,
        3
      ],
      "expected": 1
    },
    {
      "input": [
        1,
        0
      ],
      "expected": 1
    },
    {
      "input": [
        10,
        5
      ],
      "expected": 1068
    }
  ],
  "shortest-palindrome": [
    {
      "input": [
        ""
      ],
      "expected": ""
    },
    {
      "input": [
        "a"
      ],
      "expected": "a"
    },
    {
      "input": [
        "aba"
      ],
      "expected": "aba"
    },
    {
      "input": [
        "abbacd"
      ],
      "expected": "dcabbacd"
    },
    {
      "input": [
        "aaaa"
      ],
      "expected": "aaaa"
    }
  ],
  "scramble-string": [
    {
      "input": [
        "a",
        "a"
      ],
      "expected": true
    },
    {
      "input": [
        "a",
        "b"
      ],
      "expected": false
    },
    {
      "input": [
        "ab",
        "ba"
      ],
      "expected": true
    },
    {
      "input": [
        "eebaacbcbcadaaedceaaacadccd",
        "eadcaacabaddaceacbceaabeccd"
      ],
      "expected": false
    }
  ],
  "binary-tree-maximum-path-sum": [
    {
      "input": [
        [
          -3
        ]
      ],
      "expected": -3
    },
    {
      "input": [
        [
          2,
          -1
        ]
      ],
      "expected": 2
    },
    {
      "input": [
        [
          -2,
          -1,
          -3
        ]
      ],
      "expected": -1
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
          null,
          1
        ]
      ],
      "expected": 48
    }
  ],
  "max-points-on-a-line": [
    {
      "input": [
        [
          [
            0,
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
            0,
            0
          ],
          [
            1,
            1
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
            0,
            1
          ],
          [
            0,
            2
          ],
          [
            0,
            3
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
          ],
          [
            2,
            0
          ],
          [
            3,
            0
          ],
          [
            0,
            1
          ],
          [
            0,
            2
          ]
        ]
      ],
      "expected": 3
    }
  ],
  "sliding-window-maximum": [
    {
      "input": [
        [
          1,
          -1
        ],
        1
      ],
      "expected": [
        1,
        -1
      ]
    },
    {
      "input": [
        [
          9,
          11
        ],
        2
      ],
      "expected": [
        11
      ]
    },
    {
      "input": [
        [
          4,
          -2
        ],
        2
      ],
      "expected": [
        4
      ]
    },
    {
      "input": [
        [
          7,
          6,
          5,
          4,
          3,
          2,
          1
        ],
        3
      ],
      "expected": [
        7,
        6,
        5,
        4,
        3
      ]
    }
  ],
  "trapping-rain-water": [
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
          4
        ]
      ],
      "expected": 0
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
      "expected": 0
    },
    {
      "input": [
        [
          3,
          0,
          2,
          0,
          4
        ]
      ],
      "expected": 7
    }
  ],
  "minimum-spanning-tree": [
    {
      "input": [
        3,
        [
          [
            0,
            1,
            5
          ],
          [
            1,
            2,
            3
          ],
          [
            0,
            2,
            1
          ]
        ]
      ],
      "expected": 4
    },
    {
      "input": [
        2,
        [
          [
            0,
            1,
            7
          ]
        ]
      ],
      "expected": 7
    },
    {
      "input": [
        5,
        [
          [
            0,
            1,
            2
          ],
          [
            0,
            3,
            6
          ],
          [
            1,
            2,
            3
          ],
          [
            1,
            3,
            8
          ],
          [
            1,
            4,
            5
          ],
          [
            2,
            4,
            7
          ],
          [
            3,
            4,
            9
          ]
        ]
      ],
      "expected": 16
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
            1,
            2,
            1
          ],
          [
            2,
            3,
            1
          ],
          [
            3,
            0,
            1
          ],
          [
            0,
            2,
            10
          ]
        ]
      ],
      "expected": 3
    }
  ],
  "travelling-salesman-problem": [
    {
      "input": [
        [
          [
            0,
            10,
            15,
            20
          ],
          [
            10,
            0,
            35,
            25
          ],
          [
            15,
            35,
            0,
            30
          ],
          [
            20,
            25,
            30,
            0
          ]
        ]
      ],
      "expected": 80
    },
    {
      "input": [
        [
          [
            0,
            1000,
            5000
          ],
          [
            5000,
            0,
            1000
          ],
          [
            1000,
            5000,
            0
          ]
        ]
      ],
      "expected": 3000
    },
    {
      "input": [
        [
          [
            0,
            5,
            10
          ],
          [
            5,
            0,
            15
          ],
          [
            10,
            15,
            0
          ]
        ]
      ],
      "expected": 30
    },
    {
      "input": [
        [
          [
            0,
            1,
            100,
            100
          ],
          [
            100,
            0,
            1,
            100
          ],
          [
            100,
            100,
            0,
            1
          ],
          [
            1,
            100,
            100,
            0
          ]
        ]
      ],
      "expected": 4
    }
  ],
  "longest-valid-parentheses": [
    {
      "input": [
        "()(()"
      ],
      "expected": 2
    },
    {
      "input": [
        "(()())"
      ],
      "expected": 6
    },
    {
      "input": [
        "((("
      ],
      "expected": 0
    },
    {
      "input": [
        ")))"
      ],
      "expected": 0
    },
    {
      "input": [
        "()()()"
      ],
      "expected": 6
    }
  ],
  "sudoku-solver": [
    {
      "input": [
        [
          [
            ".",
            ".",
            "9",
            "7",
            "4",
            "8",
            ".",
            ".",
            "."
          ],
          [
            "7",
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
            "2",
            ".",
            "1",
            ".",
            "9",
            ".",
            ".",
            "."
          ],
          [
            ".",
            ".",
            "7",
            ".",
            ".",
            ".",
            "2",
            "4",
            "."
          ],
          [
            ".",
            "6",
            "4",
            ".",
            "1",
            ".",
            "5",
            "9",
            "."
          ],
          [
            ".",
            "9",
            "8",
            ".",
            ".",
            ".",
            "3",
            ".",
            "."
          ],
          [
            ".",
            ".",
            ".",
            "8",
            ".",
            "3",
            ".",
            "2",
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
            "6"
          ],
          [
            ".",
            ".",
            ".",
            "2",
            "7",
            "5",
            "9",
            ".",
            "."
          ]
        ]
      ],
      "expected": [
        [
          "5",
          "1",
          "9",
          "7",
          "4",
          "8",
          "6",
          "3",
          "2"
        ],
        [
          "7",
          "8",
          "3",
          "6",
          "5",
          "2",
          "4",
          "1",
          "9"
        ],
        [
          "4",
          "2",
          "6",
          "1",
          "3",
          "9",
          "8",
          "7",
          "5"
        ],
        [
          "3",
          "5",
          "7",
          "9",
          "8",
          "6",
          "2",
          "4",
          "1"
        ],
        [
          "2",
          "6",
          "4",
          "3",
          "1",
          "7",
          "5",
          "9",
          "8"
        ],
        [
          "1",
          "9",
          "8",
          "5",
          "2",
          "4",
          "3",
          "6",
          "7"
        ],
        [
          "9",
          "7",
          "5",
          "8",
          "6",
          "3",
          "1",
          "2",
          "4"
        ],
        [
          "8",
          "3",
          "2",
          "4",
          "9",
          "1",
          "7",
          "5",
          "6"
        ],
        [
          "6",
          "4",
          "1",
          "2",
          "7",
          "5",
          "9",
          "8",
          "3"
        ]
      ]
    },
    {
      "input": [
        [
          [
            ".",
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
            ".",
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
            "."
          ]
        ]
      ],
      "expected": [
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
    },
    {
      "input": [
        [
          [
            ".",
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
            ".",
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
            ".",
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
            ".",
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
            ".",
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
            ".",
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
            ".",
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
            ".",
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
            "."
          ]
        ]
      ],
      "expected": [
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
            "."
          ],
          [
            "6",
            "7",
            "2",
            "1",
            "9",
            "5",
            "3",
            ".",
            "8"
          ],
          [
            "1",
            "9",
            "8",
            "3",
            "4",
            "2",
            ".",
            "6",
            "7"
          ],
          [
            "8",
            "5",
            "9",
            "7",
            "6",
            ".",
            "4",
            "2",
            "3"
          ],
          [
            "4",
            "2",
            "6",
            "8",
            ".",
            "3",
            "7",
            "9",
            "1"
          ],
          [
            "7",
            "1",
            "3",
            ".",
            "2",
            "4",
            "8",
            "5",
            "6"
          ],
          [
            "9",
            "6",
            ".",
            "5",
            "3",
            "7",
            "2",
            "8",
            "4"
          ],
          [
            "2",
            ".",
            "7",
            "4",
            "1",
            "9",
            "6",
            "3",
            "5"
          ],
          [
            ".",
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
      "expected": [
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
    }
  ],
  "decode-ways-ii": [
    {
      "input": [
        "2*"
      ],
      "expected": 15
    },
    {
      "input": [
        "**"
      ],
      "expected": 96
    },
    {
      "input": [
        "*1*1*0"
      ],
      "expected": 404
    },
    {
      "input": [
        "0"
      ],
      "expected": 0
    },
    {
      "input": [
        "***"
      ],
      "expected": 999
    }
  ],
  "longest-substring-with-at-most-k-distinct-characters": [
    {
      "input": [
        "abc",
        0
      ],
      "expected": 0
    },
    {
      "input": [
        "",
        2
      ],
      "expected": 0
    },
    {
      "input": [
        "abaccc",
        2
      ],
      "expected": 4
    },
    {
      "input": [
        "aaabbbccc",
        3
      ],
      "expected": 9
    }
  ]
};
