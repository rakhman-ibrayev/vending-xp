import { PageContainer } from "@/components/page-container";
import { ItemSelection } from "@/modules/item-selection";
import { MachineRegistration } from "@/modules/machine-registration";

const VendingController = () => {
  return (
    <PageContainer>
      <MachineRegistration>
        <ItemSelection />
      </MachineRegistration>
    </PageContainer>
  );
};

export default VendingController;
