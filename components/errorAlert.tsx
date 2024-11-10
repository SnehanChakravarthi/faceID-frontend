import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ErrorAlert = ({ error }: { error: string }) => {
  return (
    <Dialog open={!!error} onOpenChange={() => {}}>
      <DialogContent className="bg-red-500 border-none">
        <DialogHeader>
          <DialogTitle className="text-white">Error</DialogTitle>
          <DialogDescription className="text-white">{error}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ErrorAlert;
