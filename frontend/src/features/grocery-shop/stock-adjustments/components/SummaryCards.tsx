import { Box, Card, CardContent, Typography } from "@mui/material";

type MoneyValue = number | string | undefined;

type StockAdjustment = {
  id: string;
  itemName: string;
  category: string;
  adjustmentType: string;
  previousQty: number;
  quantityChanged: number;
  newQty: number;
  unitPrice: MoneyValue;
  totalAmount: MoneyValue;
  reason?: string;
  remarks?: string;
  adjustmentDate: string;
  createdAt: string;
};

type Props = {
  adjustments: StockAdjustment[];
  selectedDate: string;
};

const formatMoney = (value: MoneyValue) => {
  return Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function SummaryCards({ adjustments, selectedDate }: Props) {
  const reducedAdjustments = adjustments.filter(
    (item) => item.quantityChanged < 0
  );

  const increasedAdjustments = adjustments.filter(
    (item) => item.quantityChanged > 0
  );

  const totalReducedQty = reducedAdjustments.reduce((total, item) => {
    return total + Math.abs(Number(item.quantityChanged || 0));
  }, 0);

  const totalReducedAmount = reducedAdjustments.reduce((total, item) => {
    return total + Number(item.totalAmount || 0);
  }, 0);

  const totalIncreasedQty = increasedAdjustments.reduce((total, item) => {
    return total + Number(item.quantityChanged || 0);
  }, 0);

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "repeat(4, 1fr)",
        },
        gap: 2,
        mt: 3,
      }}
    >
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary">{selectedDate} Adjustments</Typography>

          <Typography variant="h4" className="page-title" sx={{ fontWeight: "bold", mt: 1 }}>
            {adjustments.length}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary">{selectedDate} Reduced Qty</Typography>

          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", mt: 1, color: "error.main" }}
          >
            {totalReducedQty}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary">{selectedDate} Today Income</Typography>

          <Typography variant="h4" className="page-title" sx={{ fontWeight: "bold", mt: 1 }}>
            Rs. {formatMoney(totalReducedAmount)}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography color="text.secondary">{selectedDate} Increased Qty</Typography>

          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", mt: 1, color: "success.main" }}
          >
            {totalIncreasedQty}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SummaryCards;
