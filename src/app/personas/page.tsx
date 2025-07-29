// src/app/personas/page.tsx or a similar client-side component
'use client';

import { supabase } from '@/lib/supabase'; // Your client-side Supabase client
import { useAuth } from '@/hooks/useAuth'; // Assuming you have a hook to get the current user

async function fetchUserPersonas() {
  const { user } = useAuth(); // Get the currently logged-in user

  if (!user) {
    // User is not logged in, handle accordingly (e.g., redirect to login)
    return [];
  }

  const { data: userPersonas, error } = await supabase
    .from('personas')
    .select('*') // Select all columns for display
    .eq('user_id', user.id) // Filter by the current user's ID
    .order('template_id', { ascending: true }); // Or order by name, etc.

  if (error) {
    console.error("Error fetching user personas:", error);
    return [];
  }

  return userPersonas;
}

// In your React component:
// const [personas, setPersonas] = useState([]);
// useEffect(() => {
//   fetchUserPersonas().then(setPersonas);
// }, [user]); // Re-fetch if user changes
// Then render 'personas' array


// Function to update a user's persona
import { ExtendedPersona } from '@/types/persona'; // The type from your config

/**
 * Updates an existing user persona in the database.
 * @param personaId The UUID of the specific persona record to update.
 * @param updatedData The partial data containing the changes.
 */
async function updateUserPersona(personaId: string, updatedData: Partial<ExtendedPersona>) {
  const { error } = await supabase
    .from('personas')
    .update({
      // Only include fields that can be updated by the user
      name: updatedData.name,
      description: updatedData.description,
      characteristics: updatedData.characteristics,
      boundaries: updatedData.boundaries,
      system_prompt: updatedData.system_prompt,
      model_config: updatedData.modelConfig,
      avatar: updatedData.avatar,
      color: updatedData.color,
      is_customized: true, // Mark as customized since the user is editing it
      updated_at: new Date().toISOString(), // Update the timestamp
    })
    .eq('id', personaId); // Ensure we update the correct persona record

  if (error) {
    console.error(`Error updating persona ${personaId}:`, error);
    throw error; // Propagate the error for UI handling
  }
  console.log(`Persona ${personaId} updated successfully.`);
}

// In your UI, when the user saves changes:
// const handleSave = async (editedPersona: ExtendedPersona) => {
//   try {
//     await updateUserPersona(editedPersona.id, editedPersona);
//     // Refresh your persona list or update local state
//   } catch (error) {
//     // Show error message to user
//   }
// };