"use client";

import { useState, useEffect } from "react";
import {
  calculateFees,
  formatCHF,
  formatPercentage,
  type FeeCalculation,
} from "@/lib/fee-calculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, TrendingDown, TrendingUp } from "lucide-react";

interface FeeBreakdownProps {
  amount: number;
  commissionRate: number; // En pourcentage (ex: 2.5 pour 2.5%)
  fixedFee: number;
  className?: string;
}

export function FeeBreakdown({
  amount,
  commissionRate,
  fixedFee,
  className,
}: FeeBreakdownProps) {
  const [calculation, setCalculation] = useState<FeeCalculation | null>(null);

  useEffect(() => {
    if (amount > 0) {
      const result = calculateFees(amount, commissionRate / 100, fixedFee);
      setCalculation(result);
    } else {
      setCalculation(null);
    }
  }, [amount, commissionRate, fixedFee]);

  if (!calculation || amount <= 0) {
    return null;
  }

  const isHighFeeRate = calculation.feePercentage > 5; // Plus de 5% de frais

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-blue-600" />
          Calcul des frais et revenus
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Montant original */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Prix affiché aux clients</span>
          <span className="font-semibold text-lg">
            {formatCHF(calculation.originalAmount)}
          </span>
        </div>

        <Separator />

        {/* Décomposition des frais */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center text-gray-600">
            <span>Commission ({formatPercentage(commissionRate)})</span>
            <span>- {formatCHF(calculation.commission)}</span>
          </div>

          <div className="flex justify-between items-center text-gray-600">
            <span>Frais fixes</span>
            <span>- {formatCHF(calculation.fixedFee)}</span>
          </div>

          <div className="flex justify-between items-center font-medium text-red-600">
            <span>Total des frais</span>
            <span>- {formatCHF(calculation.totalFees)}</span>
          </div>
        </div>

        <Separator />

        {/* Montant net */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Vous recevrez
          </span>
          <span className="font-bold text-xl text-green-600">
            {formatCHF(calculation.netAmount)}
          </span>
        </div>

        {/* Avertissement si les frais sont élevés */}
        {isHighFeeRate && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Frais élevés détectés</p>
              <p>
                Les frais représentent{" "}
                {formatPercentage(calculation.feePercentage)} du prix. Vous
                pourriez envisager d&apos;ajuster le prix.
              </p>
            </div>
          </div>
        )}

        {/* Résumé en pourcentage */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Frais totaux : {formatPercentage(calculation.feePercentage)} • Revenus
          nets : {formatPercentage(100 - calculation.feePercentage)}
        </div>
      </CardContent>
    </Card>
  );
}
