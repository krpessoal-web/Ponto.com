/* Kronius — documentos exportados (PDF/Excel) com a identidade visual do sistema */
(function(){
const KR_TILE="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNDNDI5M0QiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1NjA3MTMiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgcng9IjExMiIgZmlsbD0idXJsKCN0KSIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExMCAxMTEpIHNjYWxlKDEuNykiPjxwYXRoIGQ9Ik0zMi41NiAxNTguNjRDMzUuNzUgMTU3Ljg2IDM4LjE1IDE1Ni43NiA0MC40NSAxNTUuMDZDNDEuMDIgMTU0LjY0IDQzLjE0IDE1Mi42MCA0NS40NCAxNTAuMjdDNDcuNjQgMTQ4LjA0IDUyLjMzIDE0My4yOCA1NS44OCAxMzkuNjlDNTkuNDIgMTM2LjEwIDY0LjY1IDEzMC43OCA2Ny41MCAxMjcuODdDNzcuODMgMTE3LjMwIDEwMi4yNyA5Mi41MSAxMTUuMDcgNzkuNjJDMTE5LjEzIDc1LjUzIDEyNC43NSA2OS44MyAxMjcuNTYgNjYuOTRDMTMwLjM3IDY0LjA1IDEzNS4xMCA1OS4yNCAxMzguMDYgNTYuMjVDMTUwLjY3IDQzLjUxIDE1NC43MSAzOS40MSAxNjMuODggMzAuMDZDMTY5LjIxIDI0LjYzIDE3NC42MSAxOS4xMiAxNzUuODkgMTcuODFDMTc4LjI2IDE1LjM4IDE3OC43NSAxNC43MyAxNzguNzUgMTMuOTRDMTc4Ljc1IDEzLjA3IDE3OC4wNiAxMi4yNSAxNzcuMTIgMTIuMDBDMTc2Ljc3IDExLjkwIDE2Ny43OSAxMS44OCAxNDcuMDkgMTEuOTFMMTE3LjU2IDExLjk2IEwxMTYuMTkgMTIuMjJDMTE1LjQzIDEyLjM3IDExNC4yOCAxMi42MCAxMTMuNjIgMTIuNzNDMTA5Ljc3IDEzLjUyIDEwNS40MyAxNi4xMCAxMDIuNTYgMTkuMzNDMTAyLjA4IDE5Ljg3IDk5LjYxIDIyLjQyIDk3LjA2IDI1LjAwQzk0LjUyIDI3LjU4IDkwLjUwIDMxLjY5IDg4LjEzIDM0LjEzQzg1Ljc2IDM2LjU3IDgxLjQ2IDQwLjk1IDc4LjU3IDQzLjg4Qzc1LjY4IDQ2LjgwIDcxLjIwIDUxLjM1IDY4LjYyIDU0LjAwQzYxLjE2IDYxLjY2IDM2Ljk2IDg2LjE0IDI0LjI2IDk4Ljg2QzE5LjU2IDEwMy41OCAxNS40NiAxMDcuNzcgMTUuMTYgMTA4LjE4QzEzLjg1IDEwOS45NSAxMi45OCAxMTIuMTkgMTIuNzYgMTE0LjMxQzEyLjY5IDExNS4wNyAxMi42MiAxMjMuNzEgMTIuNjAgMTM2LjI1QzEyLjU2IDE1OS4zOSAxMi40OCAxNTcuMjMgMTMuNDIgMTU4LjIzQzE0LjM0IDE1OS4yMSAxNC4xNiAxNTkuMTkgMjMuMDUgMTU5LjE4TDMwLjQ0IDE1OS4xNyBMMzIuNTYgMTU4LjY0WiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xNzcuNDggMTU4LjcyQzE3OC43MiAxNTcuODkgMTc5LjA4IDE1Ni40MCAxNzguMzEgMTU1LjIyQzE3Ny44MSAxNTQuNDYgMTczLjY5IDE1MC4wOCAxNjguNDQgMTQ0Ljc1QzE2NC40MyAxNDAuNjggMTU5LjQ1IDEzNS40OSAxNTUuMzcgMTMxLjEzQzE1NC4zOCAxMzAuMDcgMTUyLjMwIDEyNy45MSAxNTAuNzUgMTI2LjMyQzE0OS4yMCAxMjQuNzMgMTQ2LjM2IDEyMS43NyAxNDQuNDMgMTE5Ljc1QzEzOC4xOCAxMTMuMTkgMTM3LjAwIDExMS45NSAxMzMuMTIgMTA3LjkxQzEzMS4wMiAxMDUuNzMgMTI4LjU0IDEwMy4xMiAxMjcuNjMgMTAyLjEyQzEyNi43MSAxMDEuMTMgMTI0LjA3IDk4LjQwIDEyMS43NiA5Ni4wNUMxMTcuMjcgOTEuNTAgMTE2LjY1IDkxLjAwIDExNS41MCA5MS4wMEMxMTQuMzggOTEuMDAgMTE0LjE0IDkxLjIxIDEwNi4xOSA5OS4xOUM5NS43NiAxMDkuNjUgODcuNjUgMTE3Ljk3IDg3LjMwIDExOC41NkM4Ni42MSAxMTkuNzEgODcuMDEgMTIwLjM1IDkwLjY0IDEyMy45NEM5My4wNCAxMjYuMzIgOTcuNDEgMTMwLjg2IDEwMi45NyAxMzYuNzVDMTA0LjEwIDEzNy45NSAxMDYuNjcgMTQwLjYwIDEwOC42OCAxNDIuNjJDMTEwLjY5IDE0NC42NSAxMTMuMTggMTQ3LjI0IDExNC4yMSAxNDguMzhDMTIwLjE3IDE1NC45MCAxMjEuMDkgMTU1LjcwIDEyNC40NSAxNTcuMjVDMTI2LjAwIDE1Ny45NiAxMjcuMDYgMTU4LjMwIDEyOS43NSAxNTguOTRDMTMwLjMwIDE1OS4wNyAxMzQuOTMgMTU5LjEwIDE1My43MCAxNTkuMDhMMTc2Ljk2IDE1OS4wNiBMMTc3LjQ4IDE1OC43MloiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMTUuMDYgOTYuMjdDMTUuNzMgOTUuODYgMTcuNjUgOTMuOTYgMjMuMTAgODguMzJDMjYuMDQgODUuMjkgMzMuMDUgNzguMTIgMzguNjkgNzIuMzlDNDkuMjMgNjEuNjcgNTAuMDkgNjAuNzQgNTAuMzggNTkuODRDNTAuNTkgNTkuMTcgNTAuNTcgMTYuNzggNTAuMzUgMTUuOTJDNTAuMTkgMTUuMjQgNDkuNjQgMTQuNjkgNDguODQgMTQuNDFDNDguMjMgMTQuMjAgNDcuNDkgMTQuMTkgMzcuMzEgMTQuMTlMMjYuNDQgMTQuMTkgTDI0Ljk0IDE0LjU0QzE4LjQ1IDE2LjA3IDEzLjYzIDIxLjQzIDEyLjgxIDI4LjAyQzEyLjY1IDI5LjM2IDEyLjYyIDMzLjc3IDEyLjYyIDYyLjI2QzEyLjYyIDgwLjI1IDEyLjY2IDk1LjE1IDEyLjcwIDk1LjM2QzEyLjkxIDk2LjM4IDE0LjEzIDk2Ljg1IDE1LjA2IDk2LjI3WiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=",KR_WORD="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ijc4IDE0IDM5MiAxMDkiPjxwYXRoIGQ9Ik05Ni43NCAxMTguNTVDOTcuNTMgMTE4LjMyIDk4LjMzIDExNy42MyA5OC43MyAxMTYuODJMOTkuMDIgMTE2LjI1IEw5OS4wMSA5NC41OUM5OS4wMSA3My4wNSA5OS4wNiA2OS43OSA5OS40NCA2OC4xNkMxMDAuMDQgNjUuNTggMTAxLjAyIDYzLjQ2IDEwMi4xNyA2Mi4yN0MxMDMuMzMgNjEuMDYgMTA1LjUxIDU5LjcwIDEwNi44OCA1OS4zNEMxMDcuMjUgNTkuMjQgMTA4LjA3IDU4Ljk5IDEwOC42OSA1OC44MEwxMDkuODEgNTguNDUgTDExMy40NCA1OC40NUMxMTYuOTAgNTguNDUgMTE3LjEzIDU4LjQ2IDExOC41MCA1OC43OEMxMjEuMTkgNTkuNDAgMTIzLjQxIDU5LjU1IDEyNC40MSA1OS4xOUMxMjUuOTAgNTguNjYgMTI3LjUzIDU2LjkwIDEyOC41NyA1NC43MEMxMjkuMjIgNTMuMzIgMTI5LjM3IDUyLjQ5IDEyOS4zNyA1MC4yNUMxMjkuMzcgNDUuNDQgMTI4LjU2IDQ0LjY0IDEyMi4xMiA0My4wNUMxMjAuODcgNDIuNzQgMTE1LjY2IDQyLjM4IDExMi41NCA0Mi4zOEMxMDkuMTQgNDIuMzggMTA0Ljc0IDQyLjc0IDEwMy4xOSA0My4xNEMxMDIuNjQgNDMuMjkgMTAxLjU3IDQzLjU0IDEwMC44MyA0My43MEMxMDAuMDggNDMuODYgOTkuMTIgNDQuMTEgOTguNzAgNDQuMjRDOTguMjggNDQuMzggOTcuNTYgNDQuNTggOTcuMTEgNDQuNjhDOTIuNzYgNDUuNjggODguNDAgNDkuMDggODUuNzEgNTMuNTdDODQuMjMgNTYuMDQgODIuOTMgNTkuNTQgODIuNjMgNjEuODFDODIuNTYgNjIuNDMgODIuNDEgNjMuMzYgODIuMzEgNjMuODhDODEuODkgNjYuMTAgODEuODYgNjguNTAgODEuOTAgOTIuNTZMODEuOTQgMTE2LjMxIEw4Mi4yNyAxMTYuODhDODMuMjIgMTE4LjQ4IDgzLjQ1IDExOC41NSA4OC4zOCAxMTguNjNDOTYuMjggMTE4Ljc2IDk2LjA0IDExOC43NiA5Ni43NCAxMTguNTVaIiBmaWxsPSIjQzQyOTNEIi8+PHBhdGggZD0iTTE3OS4wMCAxMTkuMjBDMTc5Ljg2IDExOS4wOCAxODAuOTYgMTE4LjkxIDE4MS40NCAxMTguODBDMTgxLjkyIDExOC43MCAxODIuODUgMTE4LjUxIDE4My41MSAxMTguMzhDMTg1LjY5IDExNy45NSAxODkuMjYgMTE2LjY5IDE5MS42MiAxMTUuNTBDMTk0LjgyIDExMy45MCAxOTguNjYgMTEwLjU2IDIwMS4xOSAxMDcuMTdDMjAzLjU5IDEwMy45NyAyMDUuODggOTguMTQgMjA2LjQ1IDkzLjgxQzIwNi41NSA5Mi45OSAyMDYuNzMgOTEuOTggMjA2LjgzIDkxLjU2QzIwNy4zMSA4OS42MyAyMDcuMTggNzIuNzggMjA2LjY3IDcwLjA2QzIwNi41NiA2OS41MSAyMDYuNDMgNjguNTMgMjA2LjM3IDY3Ljg4QzIwNi4yNiA2Ni44MCAyMDUuODQgNjUuMTMgMjA1LjEyIDYzLjAwQzIwMi40MyA1NS4wMSAxOTcuNjIgNDkuMjcgMTkwLjgxIDQ1LjkxQzE4Ni43OCA0My45MyAxODMuNTMgNDIuOTEgMTgwLjI4IDQyLjYyQzE3OS40NyA0Mi41NSAxNzguMjIgNDIuNDEgMTc3LjUwIDQyLjMxQzE3NS4zNSA0Mi4wMyAxNzAuNDIgNDEuODQgMTY3LjAwIDQxLjkxQzE2My45MCA0MS45NyAxNjIuODYgNDIuMDUgMTYwLjEyIDQyLjQ0QzE1OS40MCA0Mi41NCAxNTguMjkgNDIuNjggMTU3LjY1IDQyLjc1QzE1Ny4wMiA0Mi44MiAxNTYuMDYgNDMuMDIgMTU1LjUzIDQzLjE5QzE1NS4wMCA0My4zNSAxNTQuMTcgNDMuNTcgMTUzLjY5IDQzLjY4QzE1MS4yNyA0NC4xOCAxNDYuODAgNDYuMzUgMTQ0LjIxIDQ4LjI3QzE0MC4xMyA1MS4yOSAxMzYuNDMgNTYuMzMgMTM0LjY5IDYxLjI1QzEzNC41MyA2MS43MCAxMzQuMjggNjIuMzQgMTM0LjEzIDYyLjY5QzEzMy42MCA2My45MCAxMzIuNzUgNjcuNjkgMTMyLjYyIDY5LjQ0QzEzMi4xNiA3NS42MyAxMzIuMDQgODcuNDcgMTMyLjQyIDg5Ljg0QzEzMi41MyA5MC41NSAxMzIuNjIgOTEuNDMgMTMyLjYyIDkxLjgwQzEzMi42MiA5Mi43NiAxMzMuMDcgOTUuNjUgMTMzLjM3IDk2LjYyQzEzMy41MSA5Ny4wNyAxMzMuNjggOTcuNzMgMTMzLjc2IDk4LjA5QzEzNC42MSAxMDIuMjIgMTM4Ljc5IDEwOC45MSAxNDIuNDEgMTExLjk3QzE0Ny4wMCAxMTUuODUgMTUzLjUxIDExOC41NSAxNTkuODEgMTE5LjE5QzE2MC43OCAxMTkuMjkgMTYxLjc5IDExOS4zOSAxNjIuMDYgMTE5LjQyQzE2My41OSAxMTkuNTggMTc3LjUxIDExOS40MCAxNzkuMDAgMTE5LjIwWk0xNjQuNTAgMTAzLjE3QzE2MC4xMCAxMDIuNzQgMTU3Ljg2IDEwMi4xMSAxNTUuNzAgMTAwLjY5QzE1Mi40NCA5OC41NCAxNTAuNzYgOTUuNjUgMTQ5LjUzIDkwLjA2QzE0OS4yOCA4OC45MSAxNDkuMTUgNzUuMjQgMTQ5LjM3IDczLjAwQzE0OS43NiA2OS4xMCAxNTEuNDIgNjUuMTUgMTUzLjYxIDYyLjkxQzE1Ni4wMCA2MC40NiAxNTkuNjQgNTguNzggMTYzLjE5IDU4LjQ5QzE2Ni43MCA1OC4yMSAxNzAuODMgNTguMDkgMTcyLjQzIDU4LjIzQzE3My4zMyA1OC4zMSAxNzQuNTEgNTguMzggMTc1LjA2IDU4LjM4QzE3Ni4xNCA1OC4zOCAxNzYuMTIgNTguMzggMTc4LjU5IDU5LjA1QzE4My41NiA2MC4zOSAxODcuMzggNjQuMDggMTg4LjY5IDY4LjgxQzE4OC44MCA2OS4yMiAxODkuMDMgNzAuMDAgMTg5LjIwIDcwLjU0QzE4OS43OCA3Mi40MiAxODkuODkgNzQuMzAgMTg5LjgxIDgxLjA2QzE4OS43MiA4OC41OCAxODkuNjQgODkuNzAgMTg4Ljk4IDkyLjI0QzE4Ny44NCA5Ni41OSAxODYuMTAgOTkuMDcgMTgyLjgxIDEwMC45NkMxODEuMDcgMTAxLjk3IDE3Ny42MyAxMDIuOTkgMTc1Ljk0IDEwMy4wMEMxNzUuNTMgMTAzLjAxIDE3NC43NCAxMDMuMDkgMTc0LjE5IDEwMy4xOUMxNzIuODkgMTAzLjQyIDE2Ny4wMyAxMDMuNDEgMTY0LjUwIDEwMy4xN1pNMjgyLjM0IDExOC4zOUMyODMuMDkgMTE4LjA1IDI4My42OCAxMTcuNDUgMjg0LjAyIDExNi42NkMyODQuMzkgMTE1LjgzIDI4NC4zOCA3MC4yMiAyODQuMDAgNjcuMzRDMjgyLjU1IDU2LjA2IDI3Ni45MCA0OC4zNCAyNjcuMzUgNDQuNjFDMjY2LjY0IDQ0LjMzIDI2NS42NyA0My45OSAyNjUuMTkgNDMuODZDMjY0LjcxIDQzLjcyIDI2My43NSA0My40NSAyNjMuMDYgNDMuMjVDMjYyLjM4IDQzLjA1IDI2MS4xNCA0Mi43OSAyNjAuMzEgNDIuNjhDMjU5LjQ5IDQyLjU3IDI1OC4xNCA0Mi4zNyAyNTcuMzIgNDIuMjNDMjU1LjkxIDQxLjk5IDI1NS40NCA0MS45OCAyNDkuNzUgNDIuMDRMMjQzLjY5IDQyLjA5IEwyNDAuMzEgNDIuNTRDMjM4LjE2IDQyLjgyIDIzNi41OSA0My4xMCAyMzUuOTcgNDMuMjlDMjM1LjQ0IDQzLjQ2IDIzNC44MyA0My42NCAyMzQuNjAgNDMuNjlDMjI4LjAwIDQ1LjAxIDIyMi4zNiA0OC42MyAyMTkuNTkgNTMuMzFDMjE4LjQ1IDU1LjIzIDIxNy4xMCA1OC4yOSAyMTYuNzcgNTkuNjlDMjE2LjY4IDYwLjAzIDIxNi40NSA2MC44OCAyMTYuMjUgNjEuNTZDMjE1Ljk3IDYyLjUwIDIxNS44MCA2My41OCAyMTUuNTUgNjUuODhMMjE1LjIzIDY4Ljk0IEwyMTUuMjEgODguODhDMjE1LjE5IDk5Ljg0IDIxNS4yMSAxMTAuNTMgMjE1LjI1IDExMi42MkwyMTUuMzEgMTE2LjQ0IEwyMTUuNjcgMTE3LjE2QzIxNS45NCAxMTcuNzEgMjE2LjE1IDExNy45NSAyMTYuNjAgMTE4LjIyTDIxNy4xOSAxMTguNTYgTDIyMy43NSAxMTguNTZMMjMwLjMxIDExOC41NiBMMjMwLjg4IDExOC4yM0MyMzEuMjAgMTE4LjA0IDIzMS42MiAxMTcuNjUgMjMxLjgyIDExNy4zNkwyMzIuMTkgMTE2LjgzIEwyMzIuMjcgMTEzLjE0QzIzMi4zMiAxMTEuMTAgMjMyLjM2IDEwMC44MCAyMzIuMzYgOTAuMjRDMjMyLjM2IDY5LjI5IDIzMi4zMSA3MC45MyAyMzMuMDcgNjcuODFDMjM0LjQwIDYyLjQwIDIzOC4xMiA1OS4zMiAyNDQuMzEgNTguNDlDMjQ3LjI0IDU4LjA5IDI1NC4zOSA1OC4yMSAyNTYuMjUgNTguNjhDMjU5Ljg1IDU5LjYwIDI2MS44NSA2MC42NSAyNjMuNjIgNjIuNTlDMjY1LjQxIDY0LjU0IDI2Ni43MiA2Ny43MyAyNjcuMDAgNzAuNzlDMjY3LjA3IDcxLjQ5IDI2Ny4xOCA3Mi40MCAyNjcuMjUgNzIuODFDMjY3LjMzIDczLjMxIDI2Ny4zNyA4MC42OSAyNjcuMzcgOTQuNTBDMjY3LjM3IDExOC4xNSAyNjcuMjkgMTE2LjI2IDI2OC4zNSAxMTcuNDBDMjY5LjU0IDExOC42NyAyNjkuNjUgMTE4LjY5IDI3Ni42MiAxMTguNjlDMjgxLjY5IDExOC42OSAyODEuNjkgMTE4LjY5IDI4Mi4zNCAxMTguMzlaTTMwNC41NiAzMy41N0MzMDguMTMgMzIuNjcgMzEwLjIzIDMwLjc5IDMxMS42NSAyNy4yM0wzMTIuMTcgMjUuOTQgTDMxMi4xNSAyNC4xNEMzMTIuMTMgMjIuMzkgMzEyLjEyIDIyLjMxIDMxMS42MyAyMC45MEMzMTAuOTggMTkuMDMgMzEwLjMwIDE3LjkwIDMwOS4xOSAxNi44MUMzMDUuNDMgMTMuMTUgMjk5LjcxIDEzLjE4IDI5NS45OSAxNi44OEMyOTMuMzMgMTkuNTIgMjkyLjM4IDIzLjE3IDI5My40NSAyNi43MEMyOTQuNjYgMzAuNzIgMjk3LjQ5IDMzLjA3IDMwMi4xMiAzMy45MUMzMDIuNzIgMzQuMDIgMzAyLjg2IDM0LjAwIDMwNC41NiAzMy41N1pNMzA5LjE4IDExOC40MkMzMDkuODkgMTE4LjE3IDMxMC40NCAxMTcuNzAgMzEwLjg0IDExNy4wM0wzMTEuMTkgMTE2LjQ0IEwzMTEuMTcgODEuMDJMMzExLjE0IDQ1LjYwIEwzMTAuNzYgNDQuODBDMzEwLjM3IDQ0LjAxIDMwOS44NyA0My41MiAzMDkuMDAgNDMuMDVDMzA4LjU5IDQyLjgzIDMwOC4yMiA0Mi44MSAzMDIuNjggNDIuODNDMjk4LjI1IDQyLjg0IDI5Ni42OCA0Mi44OCAyOTYuMzEgNDMuMDBDMjk1LjY0IDQzLjIyIDI5NC43MSA0NC4xMyAyOTQuMzYgNDQuOTFMMjk0LjA2IDQ1LjU2IEwyOTQuMDcgODAuNjlDMjk0LjA3IDExOS45MyAyOTMuOTkgMTE2LjQ5IDI5NC45NCAxMTcuNTlDMjk1Ljc2IDExOC41NSAyOTUuNzkgMTE4LjU1IDMwMS41MCAxMTguNjNDMzA3LjExIDExOC43MSAzMDguNDUgMTE4LjY3IDMwOS4xOCAxMTguNDJaTTM1OS4zMSAxMTkuNjJDMzY0LjA4IDExOS4zNyAzNjUuNjEgMTE5LjI1IDM2Ni45NCAxMTkuMDBDMzY5LjQyIDExOC41NCAzNzEuMzAgMTE4LjEwIDM3Mi4yNSAxMTcuNzVDMzcyLjc3IDExNy41NiAzNzMuMzggMTE3LjM2IDM3My42MiAxMTcuMzFDMzc0LjIyIDExNy4xOSAzNzYuMzYgMTE2LjIxIDM3Ny40NCAxMTUuNTlDMzc5Ljc0IDExNC4yNSAzODIuNDQgMTExLjkwIDM4NC4wNyAxMDkuODFDMzg3LjAwIDEwNi4wNiAzODguOTYgMTAwLjcwIDM4OS4zOSA5NS4yNUMzODkuNTkgOTIuNTkgMzg5LjcwIDQ2LjczIDM4OS40OSA0NS42NkMzODkuMzEgNDQuNzAgMzg4LjgzIDQzLjk0IDM4OC4wNCA0My4zN0wzODcuNDQgNDIuOTQgTDM4MS4zMSA0Mi45MEMzNzcuMjkgNDIuODcgMzc1LjAzIDQyLjkxIDM3NC43NCA0Mi45OUMzNzQuMTQgNDMuMTcgMzczLjA3IDQ0LjMwIDM3Mi44OSA0NC45NUMzNzIuNzkgNDUuMjkgMzcyLjc1IDUyLjAyIDM3Mi43NSA2Ny40NEMzNzIuNzUgOTEuODQgMzcyLjc3IDkxLjIwIDM3MS45NCA5NC4yN0MzNzEuMjggOTYuNjggMzcwLjQzIDk4LjIwIDM2OC45MSA5OS42NUMzNjcuMDAgMTAxLjQ2IDM2My45NCAxMDIuNzMgMzYwLjUzIDEwMy4xMkMzNTguODIgMTAzLjMyIDM1Mi4wNiAxMDMuMjggMzUwLjUwIDEwMy4wN0MzNDkuNzggMTAyLjk3IDM0OC43MyAxMDIuODQgMzQ4LjE3IDEwMi43NkMzNDYuODkgMTAyLjYxIDM0NC40MCAxMDEuNjQgMzQzLjE3IDEwMC44M0MzNDAuNTEgOTkuMDggMzM4LjgwIDk2LjA5IDMzOC4yMSA5Mi4xM0MzMzcuOTQgOTAuMzEgMzM3Ljk0IDkwLjI5IDMzNy45NCA2Ny44OEwzMzcuOTQgNDUuNDQgTDMzNy42NCA0NC44NEMzMzcuMjggNDQuMTEgMzM2LjgwIDQzLjYxIDMzNi4wNCA0My4xN0wzMzUuNDggNDIuODQgTDMyOS4yNyA0Mi44NkMzMjMuMzIgNDIuODkgMzIzLjA0IDQyLjkwIDMyMi41MyA0My4xNEMzMjEuOTIgNDMuNDQgMzIxLjQ0IDQzLjk2IDMyMS4wNyA0NC43NUwzMjAuODEgNDUuMzEgTDMyMC44MSA2OC44OEMzMjAuODEgOTQuODQgMzIwLjc2IDkzLjA4IDMyMS41OSA5Ny41NkMzMjIuNzggMTA0LjEwIDMyNi4yMiAxMDkuOTIgMzMwLjg4IDExMy4zMkMzMzYuMTUgMTE3LjE3IDM0MS42NiAxMTkuMDAgMzQ5LjU2IDExOS41MUMzNTAuODAgMTE5LjU5IDM1MS44NCAxMTkuNjggMzUxLjg2IDExOS43MEMzNTEuOTcgMTE5Ljc5IDM1Ny4wOSAxMTkuNzQgMzU5LjMxIDExOS42MlpNNDQ0LjEyIDExOC44NEM0NDcuNzggMTE4LjI1IDQ0OC4yOSAxMTguMTQgNDQ5Ljg4IDExNy41N0M0NTUuNjcgMTE1LjUwIDQ1OS40NSAxMTIuNzcgNDYyLjE1IDEwOC42OUM0NjMuNjEgMTA2LjQ4IDQ2NS4wMiAxMDIuOTAgNDY1LjI2IDEwMC43OEM0NjUuMzMgMTAwLjE4IDQ2NS40OCA5OS4yNCA0NjUuNjAgOTguNjlDNDY1Ljg2IDk3LjQ0IDQ2NS44OSA5My40MiA0NjUuNjUgOTIuMzhDNDY1LjU2IDkyLjAxIDQ2NS40MSA5MS4xMCA0NjUuMzIgOTAuMzdDNDY1LjIyIDg5LjYzIDQ2NS4wNSA4OC44MSA0NjQuOTQgODguNTVDNDY0LjgyIDg4LjI4IDQ2NC41OSA4Ny42NyA0NjQuNDEgODcuMTlDNDYyLjYyIDgyLjI2IDQ1OC4xMiA3Ny41MSA0NTMuMDYgNzUuMjJDNDQ3Ljc5IDcyLjg0IDQ0NC42NSA3Mi40MiA0MzEuMTIgNzIuMzBDNDIwLjg2IDcyLjIyIDQxOS42NCA3Mi4wOSA0MTcuNjMgNzAuOTNDNDE1LjQ4IDY5LjY5IDQxNC41NyA2OC4wNSA0MTQuNTYgNjUuNDRDNDE0LjU2IDY0LjAxIDQxNC41OCA2My44OSA0MTQuOTkgNjIuOTVDNDE1Ljk4IDYwLjY2IDQxNy42MyA1OS40MCA0MjAuNjggNTguNjBDNDIxLjY1IDU4LjM0IDQyMi4wMyA1OC4zMyA0MzAuNTAgNTguMjhDNDQwLjY4IDU4LjIyIDQ0Mi45NyA1OC4zMSA0NDUuMzggNTguODdDNDQ3LjA5IDU5LjI3IDQ1MC4wNCA1OS41NyA0NTEuMDUgNTkuNDRDNDUyLjAxIDU5LjMyIDQ1Mi44NiA1OS4wNSA0NTQuMDYgNTguNTBDNDU2LjUxIDU3LjM3IDQ1Ny42NCA1NS45OSA0NTguNzYgNTIuNzVDNDU5LjI4IDUxLjIzIDQ1OS4zMCA1MS4xNCA0NTkuMzAgNDkuNTZDNDU5LjMxIDQ3LjcyIDQ1OS4xNSA0Ny4wNiA0NTguNDUgNDYuMDdDNDU3LjUyIDQ0Ljc2IDQ1Ni4wMSA0NC4yNiA0NTAuODEgNDMuNDlDNDQ4Ljk2IDQzLjIyIDQ0Ny4xMyA0Mi45NCA0NDYuNzYgNDIuODdDNDQ2LjM5IDQyLjgxIDQ0NC42MSA0Mi42NyA0NDIuODIgNDIuNTZDNDQxLjAzIDQyLjQ2IDQzOS4wMyA0Mi4zMiA0MzguMzggNDIuMjVDNDM0Ljk1IDQxLjkwIDQyNC4wNyA0Mi4wMiA0MjEuMTIgNDIuNDRDNDIwLjg4IDQyLjQ3IDQxOS44OCA0Mi41OCA0MTguOTAgNDIuNjlDNDEzLjg2IDQzLjIwIDQwNy45MyA0NS44MCA0MDQuNjcgNDguOTFDMzk5LjA5IDU0LjI0IDM5Ni43NSA2MS4yMyAzOTcuNzUgNjkuNTNDMzk3Ljk4IDcxLjQ2IDM5OS40NyA3NS41MiA0MDAuNjIgNzcuMzhDNDA0LjIzIDgzLjIwIDQwOS44NSA4Ni41OCA0MTguMDQgODcuODdDNDIwLjQ3IDg4LjI1IDQyMC42MCA4OC4yNSA0MzAuNjIgODguMzFDNDQxLjA3IDg4LjM4IDQ0MS40MiA4OC40MCA0NDMuOTEgODkuMTdDNDQ5LjkyIDkxLjA0IDQ1MC41OSA5OS4yOSA0NDQuOTUgMTAxLjk0QzQ0Mi42MyAxMDMuMDQgNDQxLjcxIDEwMy4xNSA0MzQuMTIgMTAzLjI2QzQyNS41NyAxMDMuMzkgNDE2LjQxIDEwMy4yOSA0MTUuMDYgMTAzLjA2QzQxNC41MSAxMDIuOTYgNDEzLjQ0IDEwMi44MiA0MTIuNjkgMTAyLjc1QzQxMS4wMCAxMDIuNTkgNDEwLjIyIDEwMi40NSA0MDkuMTUgMTAyLjEzQzQwNi43OSAxMDEuNDMgNDA0LjAzIDEwMS4yMSA0MDIuODIgMTAxLjYyQzQwMS4wMSAxMDIuMjUgMzk5LjE1IDEwNC4zNiAzOTguNjcgMTA2LjMyQzM5OC4zOSAxMDcuNDkgMzk4LjM5IDExMC4xNSAzOTguNjcgMTExLjIzQzM5OS4xMyAxMTMuMDEgNDAxLjEwIDExNC45NyA0MDMuNTAgMTE2LjA1QzQwNi4xNSAxMTcuMjMgNDA4Ljc1IDExNy45OSA0MTEuMzEgMTE4LjMyQzQxMi4xNCAxMTguNDMgNDEzLjEyIDExOC42MCA0MTMuNTAgMTE4LjcwQzQxNC4wOSAxMTguODUgNDE1LjA5IDExOC45NiA0MTcuODggMTE5LjE3QzQxOC4xOCAxMTkuMTkgNDIzLjc1IDExOS4yMCA0MzAuMjUgMTE5LjE5TDQ0Mi4wNiAxMTkuMTggTDQ0NC4xMiAxMTguODRaIiBmaWxsPSIjMzAzMjM4Ii8+PC9zdmc+";
  const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  const CSS=`
  @page{size:A4 portrait;margin:14mm 12mm 16mm}
  *{box-sizing:border-box}
  html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{margin:0;color:#303238;font:11px/1.45 Inter,-apple-system,"Segoe UI",Arial,sans-serif;background:#ffffff}
  .doc-head{position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:22px 26px 20px;border-radius:14px;color:#ffffff;background:radial-gradient(ellipse at 92% 8%,rgba(214,79,97,.38),transparent 46%),linear-gradient(135deg,#250307 0%,#46060f 55%,#600915 100%)}
  .doc-head:after{content:"";position:absolute;right:-70px;bottom:-95px;width:300px;height:190px;border:1px solid rgba(229,172,180,.35);border-radius:50%;transform:rotate(-24deg)}
  .doc-brand{position:relative;z-index:1}
  .doc-lockup{display:flex;align-items:center;gap:9px}.doc-tile{width:30px;height:30px}.doc-word{height:19px}
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
