async function main() {
  var contributors = require("./spreadSheetExport");

  const { sourcecred } = require("sourcecred");
  const fs = require("fs");
  const path = require("path");
  const { Ledger } = sourcecred.ledger.ledger;
  const createLedgerDiskStorage = (ledgerFilePath) => ({
    read: async () => {
      return Ledger.parse(fs.readFileSync(ledgerFilePath).toString());
    },
    write: async (ledger) => {
      fs.writeFileSync(ledgerFilePath, ledger.serialize());
    },
  });
  const { LedgerManager } = sourcecred.ledger.manager;

  const diskStorage = createLedgerDiskStorage(path.resolve("data/ledger.json"));

  const ledgerManager = new LedgerManager({
    storage: diskStorage,
  });

  await ledgerManager.reloadLedger();
  for (let contributor of contributors) {
    const sourceCredAccount = ledgerManager.ledger.accountByAddress(
      `N\u0000sourcecred\u0000discord\u0000MEMBER\u0000user\u0000${contributor.discordId}\u0000`
    );

    if (sourceCredAccount) {
      const sourceCredId = sourceCredAccount.identity.id;
      ledgerManager.ledger.activate(sourceCredId);

      console.log("activating ", contributor.discordId, "...", sourceCredId);

      ledgerManager.ledger.setPayoutAddress(
        sourceCredId,
        contributor.yourErc20WalletAddress,
        "137",
        "0x53D76f967De13E7F95e90196438DCe695eCFA957"
      );
    }
  }
  ledgerManager.persist();
}
main();
