import {create} from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

type State = {
    name : string | null,
    setName : (name:string | null) => void ,
}

export const useStore = create<State>()(
    devtools(
      persist(
        immer((set, get) => ({
            name : null,
            setName(name:string | null){
                set((state)=>{
                    state.name = name
                })
            }
        })),
        {
          name: 'testStore',
          partialize: (state) => ({})
        }
    ))
);