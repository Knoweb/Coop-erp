package com.coop.erp.reports.service;

import com.coop.erp.accounting.entity.AccountType;
import com.coop.erp.accounting.entity.JournalEntryLine;
import com.coop.erp.accounting.entity.NormalBalance;
import com.coop.erp.accounting.repository.JournalEntryLineRepository;
import com.coop.erp.reports.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinancialReportService {

    private final JournalEntryLineRepository journalEntryLineRepository;

    public IncomeStatementResponse getIncomeStatement(LocalDate fromDate, LocalDate toDate) {
        List<JournalEntryLine> lines = journalEntryLineRepository.findByDateBetween(
                fromDate != null ? fromDate : LocalDate.of(2000, 1, 1),
                toDate != null ? toDate : LocalDate.now()
        );

        Map<String, BigDecimal> revenues = new HashMap<>();
        Map<String, BigDecimal> cogs = new HashMap<>();
        Map<String, BigDecimal> expenses = new HashMap<>();

        for (JournalEntryLine line : lines) {
            String accName = line.getAccount().getAccountName();
            BigDecimal amount = line.getCredit().subtract(line.getDebit()); // REVENUE normal = CREDIT
            if (line.getAccount().getAccountType() == AccountType.REVENUE) {
                revenues.put(accName, revenues.getOrDefault(accName, BigDecimal.ZERO).add(amount));
            } else if (line.getAccount().getAccountType() == AccountType.COGS) {
                amount = line.getDebit().subtract(line.getCredit()); // COGS normal = DEBIT
                cogs.put(accName, cogs.getOrDefault(accName, BigDecimal.ZERO).add(amount));
            } else if (line.getAccount().getAccountType() == AccountType.EXPENSE) {
                amount = line.getDebit().subtract(line.getCredit()); // EXPENSE normal = DEBIT
                expenses.put(accName, expenses.getOrDefault(accName, BigDecimal.ZERO).add(amount));
            }
        }

        List<ReportLineDto> revList = revenues.entrySet().stream()
                .map(e -> new ReportLineDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
        List<ReportLineDto> cogsList = cogs.entrySet().stream()
                .map(e -> new ReportLineDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
        List<ReportLineDto> expList = expenses.entrySet().stream()
                .map(e -> new ReportLineDto(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = revList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCogs = cogsList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExp = expList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grossProfit = totalRevenue.subtract(totalCogs);
        BigDecimal netIncome = grossProfit.subtract(totalExp);

        return IncomeStatementResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .revenue(revList)
                .costOfGoods(cogsList)
                .expenses(expList)
                .totalRevenue(totalRevenue)
                .totalCostOfGoods(totalCogs)
                .grossProfit(grossProfit)
                .totalExpenses(totalExp)
                .netIncome(netIncome)
                .build();
    }

    public BalanceSheetResponse getBalanceSheet(LocalDate asOfDate) {
        LocalDate endOfDay = asOfDate != null ? asOfDate : LocalDate.now();
        List<JournalEntryLine> lines = journalEntryLineRepository.findByDateBeforeOrEqual(endOfDay);

        Map<String, BigDecimal> assets = new HashMap<>();
        Map<String, BigDecimal> liabilities = new HashMap<>();
        Map<String, BigDecimal> equity = new HashMap<>();

        BigDecimal netIncome = BigDecimal.ZERO;

        for (JournalEntryLine line : lines) {
            String accName = line.getAccount().getAccountName();
            AccountType type = line.getAccount().getAccountType();

            if (type == AccountType.ASSET) {
                BigDecimal amount = line.getDebit().subtract(line.getCredit());
                assets.put(accName, assets.getOrDefault(accName, BigDecimal.ZERO).add(amount));
            } else if (type == AccountType.LIABILITY) {
                BigDecimal amount = line.getCredit().subtract(line.getDebit());
                liabilities.put(accName, liabilities.getOrDefault(accName, BigDecimal.ZERO).add(amount));
            } else if (type == AccountType.EQUITY) {
                BigDecimal amount = line.getCredit().subtract(line.getDebit());
                equity.put(accName, equity.getOrDefault(accName, BigDecimal.ZERO).add(amount));
            } else if (type == AccountType.REVENUE) {
                netIncome = netIncome.add(line.getCredit().subtract(line.getDebit()));
            } else if (type == AccountType.COGS || type == AccountType.EXPENSE) {
                netIncome = netIncome.subtract(line.getDebit().subtract(line.getCredit()));
            }
        }

        // Add net income to Retained Earnings
        equity.put("Retained Earnings", equity.getOrDefault("Retained Earnings", BigDecimal.ZERO).add(netIncome));

        List<ReportLineDto> assetList = assets.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) != 0)
                .map(e -> new ReportLineDto(e.getKey(), e.getValue())).collect(Collectors.toList());
        List<ReportLineDto> liabList = liabilities.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) != 0)
                .map(e -> new ReportLineDto(e.getKey(), e.getValue())).collect(Collectors.toList());
        List<ReportLineDto> eqList = equity.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) != 0)
                .map(e -> new ReportLineDto(e.getKey(), e.getValue())).collect(Collectors.toList());

        BigDecimal totalAssets = assetList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalLiab = liabList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEq = eqList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return BalanceSheetResponse.builder()
                .asOfDate(asOfDate)
                .assets(assetList)
                .liabilities(liabList)
                .equity(eqList)
                .totalAssets(totalAssets)
                .totalLiabilities(totalLiab)
                .totalEquity(totalEq)
                .liabilitiesAndEquity(totalLiab.add(totalEq))
                .balanced(totalAssets.compareTo(totalLiab.add(totalEq)) == 0)
                .build();
    }

    public TrialBalanceResponse getTrialBalance(LocalDate fromDate, LocalDate toDate) {
        List<JournalEntryLine> lines = journalEntryLineRepository.findByDateBetween(
                fromDate != null ? fromDate : LocalDate.of(2000, 1, 1),
                toDate != null ? toDate : LocalDate.now()
        );

        Map<String, TrialBalanceLineDto> accounts = new HashMap<>();
        BigDecimal totalDebit = BigDecimal.ZERO;
        BigDecimal totalCredit = BigDecimal.ZERO;

        for (JournalEntryLine line : lines) {
            String code = line.getAccount().getAccountCode();
            TrialBalanceLineDto dto = accounts.computeIfAbsent(code, k -> new TrialBalanceLineDto(code, line.getAccount().getAccountName(), BigDecimal.ZERO, BigDecimal.ZERO));
            dto.setDebit(dto.getDebit().add(line.getDebit()));
            dto.setCredit(dto.getCredit().add(line.getCredit()));
        }

        List<TrialBalanceLineDto> rows = new ArrayList<>();
        for (TrialBalanceLineDto dto : accounts.values()) {
            // Standardize balances
            if (dto.getDebit().compareTo(dto.getCredit()) > 0) {
                dto.setDebit(dto.getDebit().subtract(dto.getCredit()));
                dto.setCredit(BigDecimal.ZERO);
            } else {
                dto.setCredit(dto.getCredit().subtract(dto.getDebit()));
                dto.setDebit(BigDecimal.ZERO);
            }
            if (dto.getDebit().compareTo(BigDecimal.ZERO) > 0 || dto.getCredit().compareTo(BigDecimal.ZERO) > 0) {
                rows.add(dto);
                totalDebit = totalDebit.add(dto.getDebit());
                totalCredit = totalCredit.add(dto.getCredit());
            }
        }

        rows.sort(Comparator.comparing(TrialBalanceLineDto::getAccountCode));

        return TrialBalanceResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .rows(rows)
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .balanced(totalDebit.compareTo(totalCredit) == 0)
                .build();
    }

    public CashFlowResponse getCashFlow(LocalDate fromDate, LocalDate toDate) {
        List<JournalEntryLine> lines = journalEntryLineRepository.findByDateBetween(
                fromDate != null ? fromDate : LocalDate.of(2000, 1, 1),
                toDate != null ? toDate : LocalDate.now()
        );

        Map<String, BigDecimal> ops = new HashMap<>();
        
        for (JournalEntryLine line : lines) {
            // Find entries affecting cash (1000 or 1010)
            if (line.getAccount().getAccountCode().equals("1000") || line.getAccount().getAccountCode().equals("1010")) {
                // Find opposite lines in the same journal entry
                for (JournalEntryLine other : line.getJournalEntry().getLines()) {
                    if (!other.getId().equals(line.getId())) {
                        AccountType type = other.getAccount().getAccountType();
                        if (type == AccountType.REVENUE) {
                            BigDecimal val = line.getDebit().subtract(line.getCredit());
                            ops.put("Cash from Sales", ops.getOrDefault("Cash from Sales", BigDecimal.ZERO).add(val));
                        } else if (type == AccountType.COGS || type == AccountType.ASSET) {
                            BigDecimal val = line.getDebit().subtract(line.getCredit());
                            ops.put("Cash paid for Inventory/Purchases", ops.getOrDefault("Cash paid for Inventory/Purchases", BigDecimal.ZERO).add(val));
                        } else if (type == AccountType.EXPENSE) {
                            BigDecimal val = line.getDebit().subtract(line.getCredit());
                            ops.put("Cash paid for Expenses", ops.getOrDefault("Cash paid for Expenses", BigDecimal.ZERO).add(val));
                        }
                    }
                }
            }
        }

        List<ReportLineDto> opList = ops.entrySet().stream()
                .map(e -> new ReportLineDto(e.getKey(), e.getValue())).collect(Collectors.toList());
        
        BigDecimal netOp = opList.stream().map(ReportLineDto::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return CashFlowResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .operatingActivities(opList)
                .investingActivities(new ArrayList<>())
                .financingActivities(new ArrayList<>())
                .netOperatingCashFlow(netOp)
                .netInvestingCashFlow(BigDecimal.ZERO)
                .netFinancingCashFlow(BigDecimal.ZERO)
                .netCashFlow(netOp)
                .build();
    }

    public GeneralLedgerResponse getGeneralLedger(LocalDate fromDate, LocalDate toDate, String accountCode) {
        LocalDate fromD = fromDate != null ? fromDate : LocalDate.of(2000, 1, 1);
        LocalDate toD = toDate != null ? toDate : LocalDate.now();

        List<JournalEntryLine> lines;
        if (accountCode != null && !accountCode.isEmpty()) {
            lines = journalEntryLineRepository.findByDateBetweenAndAccountCode(fromD, toD, accountCode);
        } else {
            lines = journalEntryLineRepository.findByDateBetween(fromD, toD);
        }

        lines.sort(Comparator.comparing((JournalEntryLine l) -> l.getJournalEntry().getEntryDate())
                .thenComparing(l -> l.getJournalEntry().getEntryNumber()));

        List<LedgerLineDto> rows = new ArrayList<>();
        BigDecimal balance = BigDecimal.ZERO;

        // If specific account, get opening balance
        if (accountCode != null && !accountCode.isEmpty() && lines.size() > 0) {
            List<JournalEntryLine> past = journalEntryLineRepository.findByDateBeforeOrEqualAndAccountCode(fromD.minusDays(1), accountCode);
            NormalBalance nb = lines.get(0).getAccount().getNormalBalance();
            for (JournalEntryLine p : past) {
                if (nb == NormalBalance.DEBIT) {
                    balance = balance.add(p.getDebit()).subtract(p.getCredit());
                } else {
                    balance = balance.add(p.getCredit()).subtract(p.getDebit());
                }
            }
            if (balance.compareTo(BigDecimal.ZERO) != 0) {
                rows.add(new LedgerLineDto(fromD.minusDays(1), "OPENING", "Opening Balance", accountCode, lines.get(0).getAccount().getAccountName(), BigDecimal.ZERO, BigDecimal.ZERO, balance));
            }
        }

        for (JournalEntryLine line : lines) {
            NormalBalance nb = line.getAccount().getNormalBalance();
            if (nb == NormalBalance.DEBIT) {
                balance = balance.add(line.getDebit()).subtract(line.getCredit());
            } else {
                balance = balance.add(line.getCredit()).subtract(line.getDebit());
            }
            rows.add(new LedgerLineDto(
                    line.getJournalEntry().getEntryDate(),
                    line.getJournalEntry().getEntryNumber(),
                    line.getDescription() != null ? line.getDescription() : line.getJournalEntry().getDescription(),
                    line.getAccount().getAccountCode(),
                    line.getAccount().getAccountName(),
                    line.getDebit(),
                    line.getCredit(),
                    accountCode != null && !accountCode.isEmpty() ? balance : BigDecimal.ZERO
            ));
        }

        return GeneralLedgerResponse.builder()
                .fromDate(fromDate)
                .toDate(toDate)
                .accountCode(accountCode)
                .rows(rows)
                .build();
    }
}
