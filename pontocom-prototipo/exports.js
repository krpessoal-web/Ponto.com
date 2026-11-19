/* Kronius — documentos exportados (PDF/Excel) com a identidade visual do sistema */
(function(){
const KR_TILE="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNDNDI5M0QiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NjA3MTMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjExMiIgZmlsbD0idXJsKCN0KSIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMCAxMTEpIHNjYWxlKDEuNykiPjxwYXRoIGQ9Ik0zMi41NiAxNTguNjRDMzUuNzUgMTU3Ljg2IDM4LjE1IDE1Ni43NiA0MC40NSAxNTUuMDZDNDEuMDIgMTU0LjY0IDQzLjE0IDE1Mi42MCA0NS40NCAxNTAuMjdDNDcuNjQgMTQ4LjA0IDUyLjMzIDE0My4yOCA1NS44OCAxMzkuNjlDNTkuNDIgMTM2LjEwIDY0LjY1IDEzMC43OCA2Ny41MCAxMjcuODdDNzcuODMgMTE3LjMwIDEwMi4yNyA5Mi41MSAxMTUuMDcgNzkuNjJDMTE5LjEzIDc1LjUzIDEyNC43NSA2OS44MyAxMjcuNTYgNjYuOTRDMTMwLjM3IDY0LjA1IDEzNS4xMCA1OS4yNCAxMzguMDYgNTYuMjVDMTUwLjY3IDQzLjUxIDE1NC43MSAzOS40MSAxNjMuODggMzAuMDZDMTY5LjIxIDI0LjYzIDE3NC42MSAxOS4xMiAxNzUuODkgMTcuODFDMTc4LjI2IDE1LjM4IDE3OC43NSAxNC43MyAxNzguNzUgMTMuOTRDMTc4Ljc1IDEzLjA3IDE3OC4wNiAxMi4yNSAxNzcuMTIgMTIuMDBDMTc2Ljc3IDExLjkwIDE2Ny43OSAxMS44OCAxNDcuMDkgMTEuOTFMMTE3LjU2IDExLjk2IEwxMTYuMTkgMTIuMjJDMTE1LjQzIDEyLjM3IDExNC4yOCAxMi42MCAxMTMuNjIgMTIuNzNDMTA5Ljc3IDEzLjUyIDEwNS40MyAxNi4xMCAxMDIuNTYgMTkuMzNDMTAyLjA4IDE5Ljg3IDk5LjYxIDIyLjQyIDk3LjA2IDI1LjAwQzk0LjUyIDI3LjU4IDkwLjUwIDMxLjY5IDg4LjEzIDM0LjEzQzg1Ljc2IDM2LjU3IDgxLjQ2IDQwLjk1IDc4LjU3IDQzLjg4Qzc1LjY4IDQ2LjgwIDcxLjIwIDUxLjM1IDY4LjYyIDU0LjAwQzYxLjE2IDYxLjY2IDM2Ljk2IDg2LjE0IDI0LjI2IDk4Ljg2QzE5LjU2IDEwMy41OCAxNS40NiAxMDcuNzcgMTUuMTYgMTA4LjE4QzEzLjg1IDEwOS45NSAxMi45OCAxMTIuMTkgMTIuNzYgMTE0LjMxQzEyLjY5IDExNS4wNyAxMi42MiAxMjMuNzEgMTIuNjAgMTM2LjI1QzEyLjU2IDE1OS4zOSAxMi40OCAxNTcuMjMgMTMuNDIgMTU4LjIzQzE0LjM0IDE1OS4yMSAxNC4xNiAxNTkuMTkgMjMuMDUgMTU5LjE4TDMwLjQ0IDE1OS4xNyBMMzIuNTYgMTU4LjY0WiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNzcuNDggMTU4LjcyQzE3OC43MiAxNTcuODkgMTc5LjA4IDE1Ni40MCAxNzguMzEgMTU1LjIyQzE3Ny44MSAxNTQuNDYgMTczLjY5IDE1MC4wOCAxNjguNDQgMTQ0Ljc1QzE2NC40MyAxNDAuNjggMTU5LjQ1IDEzNS40OSAxNTUuMzcgMTMxLjEzQzE1NC4zOCAxMzAuMDcgMTUyLjMwIDEyNy45MSAxNTAuNzUgMTI2LjMyQzE0OS4yMCAxMjQuNzMgMTQ2LjM2IDEyMS43NyAxNDQuNDMgMTE5Ljc1QzEzOC4xOCAxMTMuMTkgMTM3LjAwIDExMS45NSAxMzMuMTIgMTA3LjkxQzEzMS4wMiAxMDUuNzMgMTI4LjU0IDEwMy4xMiAxMjcuNjMgMTAyLjEyQzEyNi43MSAxMDEuMTMgMTI0LjA3IDk4LjQwIDEyMS43NiA5Ni4wNUMxMTcuMjcgOTEuNTAgMTE2LjY1IDkxLjAwIDExNS41MCA5MS4wMEMxMTQuMzggOTEuMDAgMTE0LjE0IDkxLjIxIDEwNi4xOSA5OS4xOUM5NS43NiAxMDkuNjUgODcuNjUgMTE3Ljk3IDg3LjMwIDExOC41NkM4Ni42MSAxMTkuNzEgODcuMDEgMTIwLjM1IDkwLjY0IDEyMy45NEM5My4wNCAxMjYuMzIgOTcuNDEgMTMwLjg2IDEwMi45NyAxMzYuNzVDMTA0LjEwIDEzNy45NSAxMDYuNjcgMTQwLjYwIDEwOC42OCAxNDIuNjJDMTEwLjY5IDE0NC42NSAxMTMuMTggMTQ3LjI0IDExNC4yMSAxNDguMzhDMTIwLjE3IDE1NC45MCAxMjEuMDkgMTU1LjcwIDEyNC40NSAxNTcuMjVDMTI2LjAwIDE1Ny45NiAxMjcuMDYgMTU4LjMwIDEyOS43NSAxNTguOTRDMTMwLjMwIDE1OS4wNyAxMzQuOTMgMTU5LjEwIDE1My43MCAxNTkuMDhMMTc2Ljk2IDE1OS4wNiBMMTc3LjQ4IDE1OC43MloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTUuMDYgOTYuMjdDMTUuNzMgOTUuODYgMTcuNjUgOTMuOTYgMjMuMTAgODguMzJDMjYuMDQgODUuMjkgMzMuMDUgNzguMTIgMzguNjkgNzIuMzlDNDkuMjMgNjEuNjcgNTAuMDkgNjAuNzQgNTAuMzggNTkuODRDNTAuNTkgNTkuMTcgNTAuNTcgMTYuNzggNTAuMzUgMTUuOTJDNTAuMTkgMTUuMjQgNDkuNjQgMTQuNjkgNDguODQgMTQuNDFDNDguMjMgMTQuMjAgNDcuNDkgMTQuMTkgMzcuMzEgMTQuMTlMMjYuNDQgMTQuMTkgTDI0Ljk0IDE0LjU0QzE4LjQ1IDE2LjA3IDEzLjYzIDIxLjQzIDEyLjgxIDI4LjAyQzEyLjY1IDI5LjM2IDEyLjYyIDMzLjc3IDEyLjYyIDYyLjI2QzEyLjYyIDgwLjI1IDEyLjY2IDk1LjE1IDEyLjcwIDk1LjM2QzEyLjkxIDk2LjM4IDE0LjEzIDk2Ljg1IDE1LjA2IDk2LjI3WiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=",KR_WORD="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ii0yIC0xNCA0MTMgODIiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAuMCA2Ni4wKSI+PHBhdGggZD0iTTUuMDU1NTU1NTU1NTU1NTU1IDAuMFYtNTEuOTk5OTk5OTk5OTk5OTlIMTIuNjAyNzc3Nzc3Nzc3Nzc2Vi0yNy43MzMzMzMzMzMzMzMzM0wzNC4zNzc3Nzc3Nzc3Nzc3NyAtNTEuOTk5OTk5OTk5OTk5OTlINDMuNzY2NjY2NjY2NjY2NjY2TDIwLjc2Mzg4ODg4ODg4ODg4NiAtMjYuNjEzODg4ODg4ODg4ODg3TDQ1LjQ2Mzg4ODg4ODg4ODg4IDAuMEgzNS43ODYxMTExMTExMTExMDRMMTIuNjAyNzc3Nzc3Nzc3Nzc2IC0yNC44NDQ0NDQ0NDQ0NDQ0NFYwLjBaIE02Ni40MDgzMzMzMzMzMzMzMiAwLjBWLTUxLjk5OTk5OTk5OTk5OTk5SDg3LjQyNDk5OTk5OTk5OTk4UTg4LjE4MzMzMzMzMzMzMzMyIC01MS45OTk5OTk5OTk5OTk5OSA4OS4zMDI3Nzc3Nzc3Nzc3OCAtNTEuOTQ1ODMzMzMzMzMzMzI2UTkwLjQyMjIyMjIyMjIyMjIyIC01MS44OTE2NjY2NjY2NjY2NiA5MS40MzMzMzMzMzMzMzMzMiAtNTEuNzExMTExMTExMTExMTFROTUuNzY2NjY2NjY2NjY2NjUgLTUxLjAyNSA5OC42NzM2MTExMTExMTExIC00OC43NVExMDEuNTgwNTU1NTU1NTU1NTUgLTQ2LjQ3NDk5OTk5OTk5OTk5NCAxMDMuMDI0OTk5OTk5OTk5OTkgLTQzLjAwODMzMzMzMzMzMzMyNlExMDQuNDY5NDQ0NDQ0NDQ0NDMgLTM5LjU0MTY2NjY2NjY2NjY2NCAxMDQuNDY5NDQ0NDQ0NDQ0NDMgLTM1LjM1Mjc3Nzc3Nzc3Nzc3NFExMDQuNDY5NDQ0NDQ0NDQ0NDMgLTI5LjE0MTY2NjY2NjY2NjY2MiAxMDEuMjkxNjY2NjY2NjY2NjYgLTI0LjY2Mzg4ODg4ODg4ODg4OFE5OS4xNjExMTExMTExMTExIC0yMS42MzA1NTU1NTU1NTU1NTMgOTUuNjIyMjIyMjIyMjIyMiAtMjAuMTVMMTA1LjQ0NDQ0NDQ0NDQ0NDQzIDAuMEg5Ni44MTM4ODg4ODg4ODg4N0w4Ny43NDk5OTk5OTk5OTk5OSAtMTguNjY5NDQ0NDQ0NDQ0NDQ0SDczLjk1NTU1NTU1NTU1NTU1VjAuMFpNNzMuOTU1NTU1NTU1NTU1NTUgLTI1LjgxOTQ0NDQ0NDQ0NDQ0M0g4Ny4xMzYxMTExMTExMTEwOVE4Ny44NTgzMzMzMzMzMzMzMiAtMjUuODE5NDQ0NDQ0NDQ0NDQzIDg4Ljc0MzA1NTU1NTU1NTU0IC0yNS44OTE2NjY2NjY2NjY2NjZRODkuNjI3Nzc3Nzc3Nzc3NzcgLTI1Ljk2Mzg4ODg4ODg4ODg4NSA5MC40MjIyMjIyMjIyMjIyMiAtMjYuMTQ0NDQ0NDQ0NDQ0NDQyUTkyLjczMzMzMzMzMzMzMzMyIC0yNi42ODYxMTExMTExMTExMSA5NC4xNDE2NjY2NjY2NjY2NSAtMjguMTQ4NjExMTExMTExMTFROTUuNTQ5OTk5OTk5OTk5OTggLTI5LjYxMTExMTExMTExMTEwNyA5Ni4xNjM4ODg4ODg4ODg4OCAtMzEuNTI0OTk5OTk5OTk5OTk1UTk2Ljc3Nzc3Nzc3Nzc3Nzc3IC0zMy40Mzg4ODg4ODg4ODg4OCA5Ni43Nzc3Nzc3Nzc3Nzc3NyAtMzUuMzUyNzc3Nzc3Nzc3Nzc0UTk2Ljc3Nzc3Nzc3Nzc3Nzc3IC0zNy4yNjY2NjY2NjY2NjY2NjYgOTYuMTYzODg4ODg4ODg4ODggLTM5LjE2MjQ5OTk5OTk5OTk5NFE5NS41NDk5OTk5OTk5OTk5OCAtNDEuMDU4MzMzMzMzMzMzMzMgOTQuMTQxNjY2NjY2NjY2NjUgLTQyLjUyMDgzMzMzMzMzMzMzUTkyLjczMzMzMzMzMzMzMzMyIC00My45ODMzMzMzMzMzMzMzMyA5MC40MjIyMjIyMjIyMjIyMiAtNDQuNTI1UTg5LjYyNzc3Nzc3Nzc3Nzc3IC00NC43NDE2NjY2NjY2NjY2NiA4OC43NDMwNTU1NTU1NTU1NCAtNDQuODEzODg4ODg4ODg4ODhRODcuODU4MzMzMzMzMzMzMzIgLTQ0Ljg4NjExMTExMTExMTEwNiA4Ny4xMzYxMTExMTExMTEwOSAtNDQuODg2MTExMTExMTExMTA2SDczLjk1NTU1NTU1NTU1NTU1WiBNMTUwLjk4MDU1NTU1NTU1NTUzIDEuMDgzMzMzMzMzMzMzMzMzM1ExNDMuMTgwNTU1NTU1NTU1NTQgMS4wODMzMzMzMzMzMzMzMzMzIDEzNy42OTE2NjY2NjY2NjY2NiAtMi4zMjkxNjY2NjY2NjY2NjY2UTEzMi4yMDI3Nzc3Nzc3Nzc3NSAtNS43NDE2NjY2NjY2NjY2NjYgMTI5LjI5NTgzMzMzMzMzMzMyIC0xMS44NDQ0NDQ0NDQ0NDQ0NDNRMTI2LjM4ODg4ODg4ODg4ODg3IC0xNy45NDcyMjIyMjIyMjIyMiAxMjYuMzg4ODg4ODg4ODg4ODcgLTI1Ljk5OTk5OTk5OTk5OTk5NlExMjYuMzg4ODg4ODg4ODg4ODcgLTM0LjA1Mjc3Nzc3Nzc3Nzc4IDEyOS4yOTU4MzMzMzMzMzMzMiAtNDAuMTU1NTU1NTU1NTU1NTVRMTMyLjIwMjc3Nzc3Nzc3Nzc1IC00Ni4yNTgzMzMzMzMzMzMzMjYgMTM3LjY5MTY2NjY2NjY2NjY2IC00OS42NzA4MzMzMzMzMzMzM1ExNDMuMTgwNTU1NTU1NTU1NTQgLTUzLjA4MzMzMzMzMzMzMzMzIDE1MC45ODA1NTU1NTU1NTU1MyAtNTMuMDgzMzMzMzMzMzMzMzNRMTU4Ljc0NDQ0NDQ0NDQ0NDQgLTUzLjA4MzMzMzMzMzMzMzMzIDE2NC4yNTEzODg4ODg4ODg4NyAtNDkuNjcwODMzMzMzMzMzMzNRMTY5Ljc1ODMzMzMzMzMzMzMgLTQ2LjI1ODMzMzMzMzMzMzMyNiAxNzIuNjQ3MjIyMjIyMjIyMTggLTQwLjE1NTU1NTU1NTU1NTU1UTE3NS41MzYxMTExMTExMTExIC0zNC4wNTI3Nzc3Nzc3Nzc3OCAxNzUuNTM2MTExMTExMTExMSAtMjUuOTk5OTk5OTk5OTk5OTk2UTE3NS41MzYxMTExMTExMTExIC0xNy45NDcyMjIyMjIyMjIyMiAxNzIuNjQ3MjIyMjIyMjIyMTggLTExLjg0NDQ0NDQ0NDQ0NDQ0M1ExNjkuNzU4MzMzMzMzMzMzMyAtNS43NDE2NjY2NjY2NjY2NjYgMTY0LjI1MTM4ODg4ODg4ODg3IC0yLjMyOTE2NjY2NjY2NjY2NjZRMTU4Ljc0NDQ0NDQ0NDQ0NDQgMS4wODMzMzMzMzMzMzMzMzMzIDE1MC45ODA1NTU1NTU1NTU1MyAxLjA4MzMzMzMzMzMzMzMzMzNaTTE1MC45ODA1NTU1NTU1NTU1MyAtNi4xMDI3Nzc3Nzc3Nzc3NzdRMTU2LjUwNTU1NTU1NTU1NTUzIC02LjAzMDU1NTU1NTU1NTU1NSAxNjAuMTcwODMzMzMzMzMzMyAtOC41NDAyNzc3Nzc3Nzc3NzhRMTYzLjgzNjExMTExMTExMTA4IC0xMS4wNDk5OTk5OTk5OTk5OTkgMTY1LjY3Nzc3Nzc3Nzc3Nzc1IC0xNS41NDU4MzMzMzMzMzMzM1ExNjcuNTE5NDQ0NDQ0NDQ0NDIgLTIwLjA0MTY2NjY2NjY2NjY2NCAxNjcuNTE5NDQ0NDQ0NDQ0NDIgLTI1Ljk5OTk5OTk5OTk5OTk5NlExNjcuNTE5NDQ0NDQ0NDQ0NDIgLTMxLjk1ODMzMzMzMzMzMzMzIDE2NS42Nzc3Nzc3Nzc3Nzc3NSAtMzYuNDE4MDU1NTU1NTU1NTU0UTE2My44MzYxMTExMTExMTEwOCAtNDAuODc3Nzc3Nzc3Nzc3NzcgMTYwLjE3MDgzMzMzMzMzMzMgLTQzLjM2OTQ0NDQ0NDQ0NDQ0UTE1Ni41MDU1NTU1NTU1NTU1MyAtNDUuODYxMTExMTExMTExMTEgMTUwLjk4MDU1NTU1NTU1NTUzIC00NS44OTcyMjIyMjIyMjIyMlExNDUuNDU1NTU1NTU1NTU1NTIgLTQ1Ljk2OTQ0NDQ0NDQ0NDQ0IDE0MS43OTAyNzc3Nzc3Nzc3NiAtNDMuNDc3Nzc3Nzc3Nzc3Nzc0UTEzOC4xMjQ5OTk5OTk5OTk5NyAtNDAuOTg2MTExMTExMTExMTEgMTM2LjI4MzMzMzMzMzMzMzMgLTM2LjQ3MjIyMjIyMjIyMjIxNFExMzQuNDQxNjY2NjY2NjY2NjMgLTMxLjk1ODMzMzMzMzMzMzMzIDEzNC40MDU1NTU1NTU1NTU1NCAtMjUuOTk5OTk5OTk5OTk5OTk2UTEzNC4zNjk0NDQ0NDQ0NDQ0IC0yMC4wNDE2NjY2NjY2NjY2NjQgMTM2LjIxMTExMTExMTExMTA4IC0xNS41ODE5NDQ0NDQ0NDQ0NDJRMTM4LjA1Mjc3Nzc3Nzc3Nzc1IC0xMS4xMjIyMjIyMjIyMjIyMjIgMTQxLjc1NDE2NjY2NjY2NjYzIC04LjYzMDU1NTU1NTU1NTU1NVExNDUuNDU1NTU1NTU1NTU1NTIgLTYuMTM4ODg4ODg4ODg4ODg4IDE1MC45ODA1NTU1NTU1NTU1MyAtNi4xMDI3Nzc3Nzc3Nzc3NzdaIE0xOTguNjQ3MjIyMjIyMjIyMTggMC4wVi01MS45OTk5OTk5OTk5OTk5OUgyMDYuMzAyNzc3Nzc3Nzc3NzVMMjMxLjkwNTU1NTU1NTU1NTUgLTEzLjM2MTExMTExMTExMTExVi01MS45OTk5OTk5OTk5OTk5OUgyMzkuNTYxMTExMTExMTExMDdWMC4wSDIzMS45MDU1NTU1NTU1NTU1TDIwNi4zMDI3Nzc3Nzc3Nzc3NSAtMzguNjc1VjAuMFoiIGZpbGw9IiNmZmZmZmYiLz48cmVjdCB4PSIyNjYuMyIgeT0iLTUyLjAiIHdpZHRoPSI3LjUiIGhlaWdodD0iNTIuMCIgcng9IjAuOSIgZmlsbD0iI2ZmZmZmZiIvPjxjaXJjbGUgY3g9IjI3MC4xIiBjeT0iLTU5LjMiIHI9IjUuNCIgZmlsbD0iI2ZmN2E4YyIvPjxwYXRoIGQ9Ik0zMjEuMjgwNTU1NTU1NTU1NTcgMS4wODMzMzMzMzMzMzMzMzMzUTMxNS4xNzc3Nzc3Nzc3Nzc3NSAxLjA4MzMzMzMzMzMzMzMzMzMgMzEwLjUwMTM4ODg4ODg4ODg3IC0xLjQyNjM4ODg4ODg4ODg4OVEzMDUuODI1IC0zLjkzNjExMTExMTExMTExMSAzMDMuMTg4ODg4ODg4ODg4ODcgLTguNDY4MDU1NTU1NTU1NTU1UTMwMC41NTI3Nzc3Nzc3Nzc3NSAtMTIuOTk5OTk5OTk5OTk5OTk4IDMwMC41NTI3Nzc3Nzc3Nzc3NSAtMTkuMTM4ODg4ODg4ODg4ODg2Vi01MS45NjM4ODg4ODg4ODg4OEwzMDguMjA4MzMzMzMzMzMzMyAtNTEuOTk5OTk5OTk5OTk5OTlWLTE5LjUzNjExMTExMTExMTEwOFEzMDguMjA4MzMzMzMzMzMzMyAtMTYuMjEzODg4ODg4ODg4ODkgMzA5LjMyNzc3Nzc3Nzc3NzggLTEzLjY4NjExMTExMTExMTExUTMxMC40NDcyMjIyMjIyMjIyIC0xMS4xNTgzMzMzMzMzMzMzMzEgMzEyLjMyNSAtOS40NjExMTExMTExMTExMVEzMTQuMjAyNzc3Nzc3Nzc3OCAtNy43NjM4ODg4ODg4ODg4ODggMzE2LjUzMTk0NDQ0NDQ0NDQzIC02Ljg5NzIyMjIyMjIyMjIyMlEzMTguODYxMTExMTExMTExMSAtNi4wMzA1NTU1NTU1NTU1NTUgMzIxLjI4MDU1NTU1NTU1NTU3IC02LjAzMDU1NTU1NTU1NTU1NVEzMjMuNzM2MTExMTExMTExMSAtNi4wMzA1NTU1NTU1NTU1NTUgMzI2LjA2NTI3Nzc3Nzc3Nzc0IC02LjkxNTI3Nzc3Nzc3Nzc3N1EzMjguMzk0NDQ0NDQ0NDQ0NDUgLTcuNzk5OTk5OTk5OTk5OTk5IDMzMC4yNzIyMjIyMjIyMjIyNCAtOS40OTcyMjIyMjIyMjIyMlEzMzIuMTUgLTExLjE5NDQ0NDQ0NDQ0NDQ0MyAzMzMuMjUxMzg4ODg4ODg4ODcgLTEzLjcyMjIyMjIyMjIyMjIyMVEzMzQuMzUyNzc3Nzc3Nzc3NzYgLTE2LjI1IDMzNC4zNTI3Nzc3Nzc3Nzc3NiAtMTkuNTM2MTExMTExMTExMTA4Vi01MS45OTk5OTk5OTk5OTk5OUgzNDIuMDA4MzMzMzMzMzMzM1YtMTkuMTM4ODg4ODg4ODg4ODg2UTM0Mi4wMDgzMzMzMzMzMzMzIC0xMy4wMzYxMTExMTExMTExMSAzMzkuMzcyMjIyMjIyMjIyMiAtOC40ODYxMTExMTExMTExMVEzMzYuNzM2MTExMTExMTExMSAtMy45MzYxMTExMTExMTExMTEgMzMyLjA1OTcyMjIyMjIyMjIgLTEuNDI2Mzg4ODg4ODg4ODg5UTMyNy4zODMzMzMzMzMzMzMzIDEuMDgzMzMzMzMzMzMzMzMzMyAzMjEuMjgwNTU1NTU1NTU1NTcgMS4wODMzMzMzMzMzMzMzMzMzWiBNMzg2Ljg1ODMzMzMzMzMzMzM1IDEuMDgzMzMzMzMzMzMzMzMzM1EzODEuMjYxMTExMTExMTExMSAxLjA4MzMzMzMzMzMzMzMzMzMgMzc2Ljc2NTI3Nzc3Nzc3NzggLTAuODQ4NjExMTExMTExMTExMVEzNzIuMjY5NDQ0NDQ0NDQ0NDUgLTIuNzgwNTU1NTU1NTU1NTU1NCAzNjkuMzYyNSAtNi4zNzM2MTExMTExMTExMVEzNjYuNDU1NTU1NTU1NTU1NiAtOS45NjY2NjY2NjY2NjY2NjUgMzY1LjU4ODg4ODg4ODg4ODkgLTE0LjkxMzg4ODg4ODg4ODg4OEwzNzMuNDYxMTExMTExMTExMSAtMTYuMTA1NTU1NTU1NTU1NTU0UTM3NC42NTI3Nzc3Nzc3Nzc3NyAtMTEuMzM4ODg4ODg4ODg4ODg5IDM3OC40NDQ0NDQ0NDQ0NDQ0NiAtOC42ODQ3MjIyMjIyMjIyMjJRMzgyLjIzNjExMTExMTExMTEgLTYuMDMwNTU1NTU1NTU1NTU1IDM4Ny4yOTE2NjY2NjY2NjY3IC02LjAzMDU1NTU1NTU1NTU1NVEzOTAuNDMzMzMzMzMzMzMzMzQgLTYuMDMwNTU1NTU1NTU1NTU1IDM5My4wNjk0NDQ0NDQ0NDQ0NiAtNy4wMjM2MTExMTExMTExMVEzOTUuNzA1NTU1NTU1NTU1NiAtOC4wMTY2NjY2NjY2NjY2NjYgMzk3LjMxMjUgLTkuODc2Mzg4ODg4ODg4ODg4UTM5OC45MTk0NDQ0NDQ0NDQ0IC0xMS43MzYxMTExMTExMTExMSAzOTguOTE5NDQ0NDQ0NDQ0NCAtMTQuMzM2MTExMTExMTExMTFRMzk4LjkxOTQ0NDQ0NDQ0NDQgLTE1Ljc0NDQ0NDQ0NDQ0NDQ0NCAzOTguNDMxOTQ0NDQ0NDQ0NCAtMTYuODI3Nzc3Nzc3Nzc3Nzc2UTM5Ny45NDQ0NDQ0NDQ0NDQ0NiAtMTcuOTExMTExMTExMTExMTA4IDM5Ny4wOTU4MzMzMzMzMzMzIC0xOC43MjM2MTExMTExMTExMDhRMzk2LjI0NzIyMjIyMjIyMjIgLTE5LjUzNjExMTExMTExMTEwOCAzOTUuMDM3NSAtMjAuMTMxOTQ0NDQ0NDQ0NDQzUTM5My44Mjc3Nzc3Nzc3Nzc4IC0yMC43Mjc3Nzc3Nzc3Nzc3NzQgMzkyLjM4MzMzMzMzMzMzMzMgLTIxLjE2MTExMTExMTExMTEwOEwzNzkuMDU4MzMzMzMzMzMzMzQgLTI1LjA5NzIyMjIyMjIyMjIyUTM3Ny4xMDgzMzMzMzMzMzMzNSAtMjUuNjc0OTk5OTk5OTk5OTk3IDM3NS4wODYxMTExMTExMTExIC0yNi41OTU4MzMzMzMzMzMzM1EzNzMuMDYzODg4ODg4ODg4ODcgLTI3LjUxNjY2NjY2NjY2NjY2NiAzNzEuMzg0NzIyMjIyMjIyMiAtMjkuMDE1Mjc3Nzc3Nzc3Nzc2UTM2OS43MDU1NTU1NTU1NTU2IC0zMC41MTM4ODg4ODg4ODg4ODYgMzY4LjY1ODMzMzMzMzMzMzM2IC0zMi43MzQ3MjIyMjIyMjIyMlEzNjcuNjExMTExMTExMTExMTQgLTM0Ljk1NTU1NTU1NTU1NTU1NiAzNjcuNjExMTExMTExMTExMTQgLTM4LjEzMzMzMzMzMzMzMzMzUTM2Ny42MTExMTExMTExMTExNCAtNDIuOTM2MTExMTExMTExMTEgMzcwLjA4NDcyMjIyMjIyMjI0IC00Ni4yNzYzODg4ODg4ODg4OVEzNzIuNTU4MzMzMzMzMzMzMzQgLTQ5LjYxNjY2NjY2NjY2NjY2IDM3Ni43ODMzMzMzMzMzMzMzIC01MS4zMzE5NDQ0NDQ0NDQ0NFEzODEuMDA4MzMzMzMzMzMzMyAtNTMuMDQ3MjIyMjIyMjIyMjIgMzg2LjI0NDQ0NDQ0NDQ0NDQ3IC01My4wNDcyMjIyMjIyMjIyMlEzOTEuNTE2NjY2NjY2NjY2NjUgLTUyLjk3NDk5OTk5OTk5OTk5NCAzOTUuNjg3NSAtNTEuMTY5NDQ0NDQ0NDQ0NDRRMzk5Ljg1ODMzMzMzMzMzMzM1IC00OS4zNjM4ODg4ODg4ODg4OSA0MDIuNjIwODMzMzMzMzMzMzQgLTQ1Ljk4NzVRNDA1LjM4MzMzMzMzMzMzMzMgLTQyLjYxMTExMTExMTExMTExIDQwNi40MzA1NTU1NTU1NTU1NCAtMzcuODA4MzMzMzMzMzMzMzNMMzk4LjM0MTY2NjY2NjY2NjcgLTM2LjQzNjExMTExMTExMTExUTM5Ny44IC0zOS4zNjExMTExMTExMTExMSAzOTYuMDMwNTU1NTU1NTU1NTcgLTQxLjQ3MzYxMTExMTExMTExUTM5NC4yNjExMTExMTExMTExIC00My41ODYxMTExMTExMTExMSAzOTEuNjk3MjIyMjIyMjIyMiAtNDQuNzIzNjExMTExMTExMTFRMzg5LjEzMzMzMzMzMzMzMzMgLTQ1Ljg2MTExMTExMTExMTExIDM4Ni4xMzYxMTExMTExMTExIC00NS44OTcyMjIyMjIyMjIyMlEzODMuMjQ3MjIyMjIyMjIyMiAtNDUuOTY5NDQ0NDQ0NDQ0NDQgMzgwLjg0NTgzMzMzMzMzMzMgLTQ1LjAzMDU1NTU1NTU1NTU1UTM3OC40NDQ0NDQ0NDQ0NDQ0NiAtNDQuMDkxNjY2NjY2NjY2NjYgMzc3LjAxODA1NTU1NTU1NTYgLTQyLjM5NDQ0NDQ0NDQ0NDQ0UTM3NS41OTE2NjY2NjY2NjY3IC00MC42OTcyMjIyMjIyMjIyMTYgMzc1LjU5MTY2NjY2NjY2NjcgLTM4LjQ5NDQ0NDQ0NDQ0NDQ0UTM3NS41OTE2NjY2NjY2NjY3IC0zNi4zMjc3Nzc3Nzc3Nzc3NzYgMzc2Ljg1NTU1NTU1NTU1NTYgLTM0Ljk5MTY2NjY2NjY2NjY2UTM3OC4xMTk0NDQ0NDQ0NDQ0NyAtMzMuNjU1NTU1NTU1NTU1NTUgMzc5Ljk3OTE2NjY2NjY2NjcgLTMyLjg3OTE2NjY2NjY2NjY2UTM4MS44Mzg4ODg4ODg4ODg5IC0zMi4xMDI3Nzc3Nzc3Nzc3NzQgMzgzLjY4MDU1NTU1NTU1NTU0IC0zMS41OTcyMjIyMjIyMjIyMThMMzkzLjI4NjExMTExMTExMTEgLTI4Ljg4ODg4ODg4ODg4ODg4NlEzOTUuMDkxNjY2NjY2NjY2NyAtMjguMzgzMzMzMzMzMzMzMzMgMzk3LjM4NDcyMjIyMjIyMjI1IC0yNy41MzQ3MjIyMjIyMjIyMlEzOTkuNjc3Nzc3Nzc3Nzc3OCAtMjYuNjg2MTExMTExMTExMTEgNDAxLjgyNjM4ODg4ODg4ODkgLTI1LjE2OTQ0NDQ0NDQ0NDQ0NFE0MDMuOTc1IC0yMy42NTI3Nzc3Nzc3Nzc3NzUgNDA1LjM4MzMzMzMzMzMzMzMgLTIxLjE0MzA1NTU1NTU1NTU1NlE0MDYuNzkxNjY2NjY2NjY2NyAtMTguNjMzMzMzMzMzMzMzMzMzIDQwNi43OTE2NjY2NjY2NjY3IC0xNC44NDE2NjY2NjY2NjY2NjVRNDA2Ljc5MTY2NjY2NjY2NjcgLTEwLjkwNTU1NTU1NTU1NTU1NSA0MDUuMjAyNzc3Nzc3Nzc3OCAtNy45MjYzODg4ODg4ODg4ODlRNDAzLjYxMzg4ODg4ODg4ODkgLTQuOTQ3MjIyMjIyMjIyMjIyIDQwMC44NTEzODg4ODg4ODg5IC0yLjk0MzA1NTU1NTU1NTU1NTVRMzk4LjA4ODg4ODg4ODg4ODkgLTAuOTM4ODg4ODg4ODg4ODg4OCAzOTQuNDc3Nzc3Nzc3Nzc3NzYgMC4wNzIyMjIyMjIyMjIyMjIyNFEzOTAuODY2NjY2NjY2NjY2NyAxLjA4MzMzMzMzMzMzMzMzMzMgMzg2Ljg1ODMzMzMzMzMzMzM1IDEuMDgzMzMzMzMzMzMzMzMzM1oiIGZpbGw9IiNmZmZmZmYiLz48L2c+PC9zdmc+";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const CSS=`
  @page{size:A4 portrait;margin:14mm 12mm 16mm}
  *{box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:0;color:#303238;font:11px/1.45 Inter,-apple-system,"Segoe UI",Arial,sans-serif;background:#ffffff}
  .doc-head{position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:22px 26px 20px;border-radius:14px;color:#ffffff;background:radial-gradient(ellipse at 92% 8%,rgba(214,79,97,.38),transparent 46%),linear-gradient(135deg,#250307 0%,#46060f 55%,#600915 100%)}
  .doc-head:after{content:"";position:absolute;right:-70px;bottom:-95px;width:300px;height:190px;border:1px solid rgba(229,172,180,.35);border-radius:50%;transform:rotate(-24deg)}
  .doc-brand{position:relative;z-index:1}
  .doc-lockup{display:flex;align-items:center;gap:9px}.doc-tile{width:30px;height:30px}.doc-word{height:15px;border-left:1px solid rgba(255,255,255,.45);padding-left:9px;box-sizing:content-box}
  .doc-wordmark{font-size:22px;font-weight:800;letter-spacing:-.8px;line-height:1}
  .doc-wordmark span{color:#e5acb4}
  .doc-tagline{margin-top:5px;color:#eaced2;font-size:8px;letter-spacing:1.7px;text-transform:uppercase}
  .doc-title{position:relative;z-index:1;text-align:right;max-width:62%}
  .doc-kicker{margin:0 0 4px;color:#e5acb4;font-size:8px;font-weight:800;letter-spacing:2px;text-transform:uppercase}
  .doc-title h1{margin:0;font-size:21px;font-weight:800;letter-spacing:-.6px;line-height:1.15}
  .doc-title p{margin:5px 0 0;color:#efdddf;font-size:10px}
  .doc-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:14px 0 0}
  .doc-meta div{padding:9px 12px;border:1px solid #e4e4e4;border-radius:10px;background:#f8f8f8}
  .doc-meta small{display:block;color:#7c7f8b;font-size:7.5px;font-weight:800;letter-spacing:1.3px;text-transform:uppercase}
  .doc-meta strong{display:block;margin-top:3px;color:#303238;font-size:11px}
  .doc-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:12px 0 4px}
  .doc-kpi{padding:11px 13px;border-radius:11px;border:1px solid #e4e4e4;border-left:3px solid #881423;background:linear-gradient(145deg,#ffffff,#f6f6f6)}
  .doc-kpi small{display:block;color:#7c7f8b;font-size:7.5px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}
  .doc-kpi strong{display:block;margin-top:4px;color:#303238;font-size:17px;font-weight:800;letter-spacing:-.5px}
  .doc-kpi.pos{border-left-color:#2f7d57}.doc-kpi.pos strong{color:#1f6a46}
  .doc-kpi.neg{border-left-color:#b62438}.doc-kpi.neg strong{color:#b62438}
  .doc-section{margin-top:18px;break-inside:auto}
  .doc-section h2{display:flex;align-items:center;gap:8px;margin:0 0 3px;color:#303238;font-size:13px;font-weight:800;letter-spacing:-.2px;break-after:avoid}
  .doc-section h2:before{content:"";width:4px;height:15px;border-radius:3px;background:linear-gradient(180deg,#d64f61,#881423)}
  .doc-section .note{margin:0 0 7px 12px;color:#7c7f8b;font-size:9px;break-after:avoid}
  table{width:100%;border-collapse:separate;border-spacing:0;margin-top:6px;font-size:9.5px}
  thead{display:table-header-group}
  th{padding:8px 9px;background:#f2f2f2;color:#6f0d1a;font-size:7.5px;font-weight:800;letter-spacing:1px;text-align:left;text-transform:uppercase;border-top:1px solid #efe1e3;border-bottom:1px solid #efe1e3}
  th:first-child{border-left:1px solid #efe1e3;border-radius:8px 0 0 0}th:last-child{border-right:1px solid #efe1e3;border-radius:0 8px 0 0}
  td{padding:7px 9px;border-bottom:1px solid #ebebeb;color:#303238;vertical-align:top}
  tbody tr{break-inside:avoid}
  tbody tr:nth-child(even) td{background:#fafafa}
  td.num,th.num{text-align:right;font-variant-numeric:tabular-nums}
  td.strong{font-weight:800;color:#303238}
  td.pos{color:#1f6a46;font-weight:800}td.neg{color:#b62438;font-weight:800}
  td.muted{color:#8a8d97}
  .empty{padding:18px;border:1px dashed #dadada;border-radius:10px;color:#7c7f8b;text-align:center}
  .signatures{display:grid;grid-template-columns:1fr 1fr;gap:46px;margin-top:54px;break-inside:avoid}
  .signatures div{padding-top:7px;border-top:1px solid #5e6069;color:#5e6069;font-size:9px;text-align:center}
  .doc-foot{display:flex;justify-content:space-between;gap:12px;margin-top:26px;padding-top:8px;border-top:1px solid #e4e4e4;color:#8a8d97;font-size:9px}
  .doc-foot b{color:#881423}
  @media screen{body{max-width:980px;margin:26px auto;padding:0 22px}}
  @media print{.doc-foot{display:none}}
  `;

  function fmtDate(iso){return iso?new Date(iso+"T12:00:00").toLocaleDateString("pt-BR"):""}

  function tableHtml(headers,rows,opts={}){
    const num=new Set(opts.numeric||[]),strong=new Set(opts.strong||[]),muted=new Set(opts.muted||[]);
    const th=headers.map((h,i)=>'<th'+(num.has(i)?' class="num"':'')+'>'+esc(h)+'</th>').join("");
    const body=rows.map(r=>'<tr>'+r.map((c,i)=>{
      let cls=[];if(num.has(i))cls.push("num");if(strong.has(i))cls.push("strong");if(muted.has(i))cls.push("muted");
      const text=String(c??"");
      if(opts.tone&&opts.tone.includes(i)){if(/^[−-]/.test(text)&&text!=="—")cls.push("neg");else if(/^\+/.test(text)||(text&&text!=="00:00"&&text!=="—"&&opts.tonePositiveIfPlain))cls.push("pos");}
      return '<td'+(cls.length?' class="'+cls.join(" ")+'"':'')+'>'+esc(c)+'</td>';
    }).join("")+'</tr>').join("");
    return '<table><thead><tr>'+th+'</tr></thead><tbody>'+(rows.length?body:'<tr><td colspan="'+headers.length+'" class="muted" style="text-align:center;padding:16px">Sem registros para exibir.</td></tr>')+'</tbody></table>';
  }

  // Lê uma <table> do DOM e devolve cabeçalhos e linhas em texto
  function readTable(table){
    const headers=[...table.querySelectorAll("thead th")].map(th=>th.innerText.trim());
    const rows=[...table.querySelectorAll("tbody tr")].map(tr=>[...tr.children].map(td=>td.innerText.replace(/\s+/g," ").trim()));
    return {headers,rows};
  }

  function buildHtml(o){
    const meta=(o.meta||[]).filter(x=>x&&x[1]!==undefined&&x[1]!=="");
    const kpis=(o.kpis||[]);
    const sections=(o.sections||[]);
    const now=new Date().toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
    const boxes='@page{@bottom-left{content:"Kronius · KR Contábil · Documento gerado pelo sistema";font:600 7.5px Inter,Arial,sans-serif;color:#8a8d97}@bottom-center{content:"Página " counter(page) " de " counter(pages);font:700 7.5px Inter,Arial,sans-serif;color:#881423}@bottom-right{content:"Emitido em '+now+'";font:600 7.5px Inter,Arial,sans-serif;color:#8a8d97}}';
    const page=boxes+(o.landscape?"@page{size:A4 landscape;margin:12mm 12mm 15mm}":"");
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>'+esc(o.title)+' · Kronius</title><style>'+CSS+page+'</style></head><body>'+
      '<header class="doc-head"><div class="doc-brand"><div class="doc-lockup"><img class="doc-tile" src="'+KR_TILE+'" alt=""><img class="doc-word" src="'+KR_WORD+'" alt="Kronius"></div><div class="doc-tagline">Gestão de Pessoas, de um jeito mais inteligente</div></div><div class="doc-title"><p class="doc-kicker">'+esc(o.kicker||"Gestão de jornada")+'</p><h1>'+esc(o.title)+'</h1>'+(o.subtitle?'<p>'+esc(o.subtitle)+'</p>':'')+'</div></header>'+
      (meta.length?'<div class="doc-meta">'+meta.map(([k,v])=>'<div><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong></div>').join("")+'</div>':'')+
      (kpis.length?'<div class="doc-kpis">'+kpis.map(k=>'<div class="doc-kpi '+(k[2]||"")+'"><small>'+esc(k[0])+'</small><strong>'+esc(k[1])+'</strong></div>').join("")+'</div>':'')+
      sections.map(s=>'<section class="doc-section">'+(s.title?'<h2>'+esc(s.title)+'</h2>':'')+(s.note?'<p class="note">'+esc(s.note)+'</p>':'')+(s.html||'')+'</section>').join("")+
      (o.signatures?'<div class="signatures"><div>'+esc(o.signatures[0]||"Assinatura do funcionário")+'</div><div>'+esc(o.signatures[1]||"Responsável pela empresa")+'</div></div>':'')+
      '<footer class="doc-foot"><span><b>Kronius</b> · KR Contábil · Documento gerado pelo sistema</span><span>Emitido em '+esc(now)+'</span></footer>'+
      '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},350)})<'+'/script></body></html>';
  }

  function openPdf(o){
    const w=window.open("","_blank");
    if(!w){return false;}
    w.document.write(buildHtml(o));w.document.close();return true;
  }

  // Excel com título, metadados e larguras de coluna
  function saveExcel(o){
    if(!window.XLSX)return false;
    const wb=XLSX.utils.book_new();
    const used=new Set();
    (o.sheets||[]).forEach((sh,i)=>{
      const head=[["KRONIUS · "+(o.title||"Relatório")]];
      (o.meta||[]).filter(x=>x&&x[1]!==undefined&&x[1]!=="").forEach(([k,v])=>head.push([k,v]));
      head.push([]);
      const aoa=[...head,sh.headers,...sh.rows];
      const ws=XLSX.utils.aoa_to_sheet(aoa);
      const widths=sh.headers.map((h,c)=>({wch:Math.min(46,Math.max(String(h).length+4,...sh.rows.map(r=>String(r[c]??"").length+2),12))}));
      ws["!cols"]=widths;
      ws["!merges"]=[{s:{r:0,c:0},e:{r:0,c:Math.max(1,sh.headers.length-1)}}];
      ws["!autofilter"]={ref:XLSX.utils.encode_range({s:{r:head.length,c:0},e:{r:head.length+sh.rows.length,c:Math.max(0,sh.headers.length-1)}})};
      let name=String(sh.name||("Planilha "+(i+1))).replace(/[\\\/?*\[\]:]/g," ").slice(0,28)||"Planilha";
      let base=name,n=2;while(used.has(name.toLowerCase())){name=base.slice(0,25)+" "+n++;}
      used.add(name.toLowerCase());
      XLSX.utils.book_append_sheet(wb,ws,name);
    });
    XLSX.writeFile(wb,o.filename||"Kronius-relatorio.xlsx");
    return true;
  }

  window.PontoDocs={esc,tableHtml,readTable,openPdf,saveExcel,fmtDate};
})();
