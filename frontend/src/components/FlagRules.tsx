import type { payload } from "../pages/Flag"
import RuleForm from "./RuleForm"
import UpdateFlag from "./UpdateFlag";

export type flag = payload["flag"]

export default function FlagRules({flag}: {flag: flag}) {
    const [flagProp, rules] = [{id: flag.id, name: flag.name, isEnabled: flag.isEnabled}, flag.rules]
    // todo: move UpdateFlag to FlagList.tsx
    return (
        <div>
            <UpdateFlag flag={flagProp}/>
            <RuleForm rules={rules} flagId={flag.id} />
        </div>
    )
}