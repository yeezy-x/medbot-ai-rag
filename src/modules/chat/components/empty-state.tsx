import { requireUser } from "@/lib/auth-utils";
import { SUGGESTED_QUESTIONS } from "../constants/suggested-questions";
import { SuggestedQuestion } from "./suggested-question";

export async function EmptyState() {
  const user = await requireUser();

  return (
    <div
      className="
      flex
      h-full
      items-center
      justify-center
      px-6
      "
    >
      <div className="w-full max-w-3xl">
        <div className="mb-10 text-center">
          <div
            className="
            mx-auto
            mb-4
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-2xl
            bg-primary
            text-primary-foreground
            text-2xl
            font-bold
            "
          >
            M
          </div>

          <h1
            className="
            text-4xl
            font-bold
            tracking-tight
            "
          >
            Hello, {user.name} 👋
          </h1>

          <p
            className="
            mt-4
            text-muted-foreground
            "
          >
            AI-powered medical assistant trained on the
            Gale Encyclopedia of Medicine.
          </p>
        </div>

        <div className="space-y-3">
          {SUGGESTED_QUESTIONS.map(
            question => (
              <SuggestedQuestion
                key={question}
                question={question}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}