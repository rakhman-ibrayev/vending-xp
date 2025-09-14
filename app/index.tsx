import { ItemSelectionHint } from "@/components/item-selection-hint";
import { PageContainer } from "@/components/page-container";
import { ItemSelection } from "@/modules/item-selection";
import { MachineRegistration } from "@/modules/machine-registration";

const VendingController = () => {
  return (
    <PageContainer>
      <MachineRegistration>
        <ItemSelectionHint />

        <ItemSelection />
      </MachineRegistration>
    </PageContainer>
  );
};

export default VendingController;
