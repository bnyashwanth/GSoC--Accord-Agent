import { runLatePaymentTest } from "./late-payment.test";
import { runNdaTest } from "./nda.test";
import { runServiceAgreementTest } from "./service-agreement.test";

async function run(): Promise<void> {
  const tests: Array<{ name: string; fn: () => Promise<void> }> = [
    { name: "nda", fn: runNdaTest },
    { name: "late-payment", fn: runLatePaymentTest },
    { name: "service-agreement", fn: runServiceAgreementTest },
  ];

  for (const testCase of tests) {
    try {
      await testCase.fn();
      console.log(`[pass] ${testCase.name}`);
    } catch (error) {
      console.error(`[fail] ${testCase.name}`);
      throw error;
    }
  }

  console.log("All starter tests passed.");
}

void run();
