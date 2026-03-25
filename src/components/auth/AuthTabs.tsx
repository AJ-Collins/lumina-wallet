import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConnectWallet from './ConnectWallet';
import CreateWallet from './CreateWallet';
import ImportWallet from './ImportWallet';
import RecoverWallet from './RecoverWallet';

export default function AuthTabs() {
  return (
    <Tabs defaultValue="connect" className="w-full">

      <TabsList>
        <TabsTrigger value="connect">Connect</TabsTrigger>
        <TabsTrigger value="create">Create</TabsTrigger>
        <TabsTrigger value="import">Import</TabsTrigger>
        <TabsTrigger value="recover">Recover</TabsTrigger>
      </TabsList>

      <TabsContent value="connect" className="mt-6">
        <ConnectWallet />
      </TabsContent>

      <TabsContent value="create" className="mt-6">
        <CreateWallet />
      </TabsContent>

      <TabsContent value="import" className="mt-6">
        <ImportWallet />
      </TabsContent>

      <TabsContent value="recover" className="mt-6">
        <RecoverWallet />
      </TabsContent>

    </Tabs>
  );
}