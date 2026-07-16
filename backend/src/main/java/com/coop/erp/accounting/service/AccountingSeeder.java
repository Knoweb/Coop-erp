package com.coop.erp.accounting.service;

import com.coop.erp.accounting.entity.AccountType;
import com.coop.erp.accounting.entity.ChartOfAccount;
import com.coop.erp.accounting.entity.NormalBalance;
import com.coop.erp.accounting.repository.ChartOfAccountRepository;
import com.coop.erp.inventory.entity.PurchaseInvoice;
import com.coop.erp.inventory.entity.Sale;
import com.coop.erp.inventory.entity.SaleItem;
import com.coop.erp.inventory.repository.PurchaseInvoiceRepository;
import com.coop.erp.inventory.repository.SaleItemRepository;
import com.coop.erp.inventory.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AccountingSeeder implements CommandLineRunner {

    private final ChartOfAccountRepository chartOfAccountRepository;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final PurchaseInvoiceRepository purchaseInvoiceRepository;
    private final JournalEntryService journalEntryService;

    @Override
    public void run(String... args) throws Exception {
        seedAccounts();
        backfillJournalEntries();
    }

    private void seedAccounts() {
        seedAccount("1000", "Cash", AccountType.ASSET, NormalBalance.DEBIT);
        seedAccount("1010", "Bank", AccountType.ASSET, NormalBalance.DEBIT);
        seedAccount("1100", "Accounts Receivable", AccountType.ASSET, NormalBalance.DEBIT);
        seedAccount("1200", "Inventory", AccountType.ASSET, NormalBalance.DEBIT);

        seedAccount("2000", "Accounts Payable", AccountType.LIABILITY, NormalBalance.CREDIT);

        seedAccount("3000", "Owner Equity", AccountType.EQUITY, NormalBalance.CREDIT);
        seedAccount("3100", "Retained Earnings", AccountType.EQUITY, NormalBalance.CREDIT);

        seedAccount("4000", "Sales Revenue", AccountType.REVENUE, NormalBalance.CREDIT);
        seedAccount("4100", "Shop Transfer Revenue", AccountType.REVENUE, NormalBalance.CREDIT);

        seedAccount("5000", "Cost of Goods Sold", AccountType.COGS, NormalBalance.DEBIT);

        seedAccount("6000", "Operating Expenses", AccountType.EXPENSE, NormalBalance.DEBIT);
        seedAccount("6100", "Utility Expense", AccountType.EXPENSE, NormalBalance.DEBIT);
        seedAccount("6200", "Salary Expense", AccountType.EXPENSE, NormalBalance.DEBIT);
    }

    private void seedAccount(String code, String name, AccountType type, NormalBalance normalBalance) {
        Optional<ChartOfAccount> existing = chartOfAccountRepository.findByAccountCode(code);
        if (existing.isEmpty()) {
            ChartOfAccount account = ChartOfAccount.builder()
                    .accountCode(code)
                    .accountName(name)
                    .accountType(type)
                    .normalBalance(normalBalance)
                    .isActive(true)
                    .build();
            chartOfAccountRepository.save(account);
        }
    }

    public void backfillJournalEntries() {
        // Backfill Sales
        List<Sale> sales = saleRepository.findAll();
        for (Sale sale : sales) {
            try {
                // Determine COGS if costPrice was available
                BigDecimal totalCogs = BigDecimal.ZERO;
                List<SaleItem> items = saleItemRepository.findBySaleId(sale.getId());
                if (items != null) {
                    for (SaleItem item : items) {
                        BigDecimal cost = null;
                        if (item.getItem() != null && item.getItem().getCostPrice() != null) {
                            cost = item.getItem().getCostPrice();
                        }
                        
                        if (cost != null) {
                            totalCogs = totalCogs.add(cost.multiply(BigDecimal.valueOf(item.getQuantity())));
                        }
                    }
                }

                // If internal shop transfer, we might skip revenue. For now, we backfill Customer sales.
                if (sale.getSaleType() != null && sale.getSaleType().name().equals("CUSTOMER") || sale.getTargetShop() == null) {
                    
                    List<JournalEntryService.JournalLineRequest> lines = new java.util.ArrayList<>(List.of(
                            new JournalEntryService.JournalLineRequest("1000", "Sale Receipt", sale.getTotalAmount(), BigDecimal.ZERO),
                            new JournalEntryService.JournalLineRequest("4000", "Sale Revenue", BigDecimal.ZERO, sale.getTotalAmount())
                    ));

                    if (totalCogs.compareTo(BigDecimal.ZERO) > 0) {
                        lines.add(new JournalEntryService.JournalLineRequest("5000", "COGS", totalCogs, BigDecimal.ZERO));
                        lines.add(new JournalEntryService.JournalLineRequest("1200", "Inventory Reduction", BigDecimal.ZERO, totalCogs));
                    }

                    journalEntryService.postEntry(
                            "SALE",
                            sale.getId(),
                            sale.getSaleDate().toLocalDate(),
                            "Backfill Sale " + sale.getSaleNumber(),
                            sale.getCreatedBy(),
                            lines
                    );
                }
            } catch (IllegalArgumentException e) {
                // Likely "Journal entry already exists", skip silently
            } catch (Exception e) {
                System.err.println("Failed to backfill sale " + sale.getId() + ": " + e.getMessage());
            }
        }

        // Backfill Purchases
        List<PurchaseInvoice> purchases = purchaseInvoiceRepository.findAll();
        for (PurchaseInvoice purchase : purchases) {
            try {
                List<JournalEntryService.JournalLineRequest> lines = List.of(
                        new JournalEntryService.JournalLineRequest("1200", "Inventory Purchase", purchase.getTotalAmount(), BigDecimal.ZERO),
                        new JournalEntryService.JournalLineRequest("1000", "Payment", BigDecimal.ZERO, purchase.getTotalAmount())
                );

                journalEntryService.postEntry(
                        "PURCHASE",
                        purchase.getId(),
                        purchase.getInvoiceDate(),
                        "Backfill Purchase " + purchase.getInvoiceNumber(),
                        "System",
                        lines
                );
            } catch (IllegalArgumentException e) {
                // Ignore if exists
            } catch (Exception e) {
                System.err.println("Failed to backfill purchase " + purchase.getId() + ": " + e.getMessage());
            }
        }
    }
}

