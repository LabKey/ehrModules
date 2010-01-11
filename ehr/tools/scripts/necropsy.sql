SELECT id, FixDate(date) AS Date, (caseno) AS caseno, (account) AS account, concat('caseno: ', caseno, ', account: ', account) AS Description FROM necropsyhead
