import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogTitle,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
  } from './ui/alert-dialog';
  
  const DrawModel = ( onClick : {onClick : () => void}) => {
    return (
      
      <AlertDialog defaultOpen={true}>
        <AlertDialogContent className='bg-stone-800 border-stone-800'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-white font-mono'>Consent: Your Opponent Suggest To Draw The Game?</AlertDialogTitle>
            <AlertDialogDescription className='text-white font-mono'>
              Would You Like To Draw The Game Here. This action cannot be undone. This will be considered as a Draw.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className='font-mono bg-[#739552] text-white font-semibold hover:bg-[#b2e084] hover:text-gray-700 border-none'>Continue</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClick.onClick}
              className='bg-[#e2e6aa] min-w-20 text-gray-900 hover:text-slate-100 hover:bg-[#bbc259] font-semibold'
            >
              Draw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  
  export default DrawModel;