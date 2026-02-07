---
name: prd
description: Convert feature requirements into structured PRD items with acceptance criteria
---

# PRD Generator

Convert feature requirements into structured Product Requirements Document (PRD) items.

## Input

The user will provide feature requirements in natural language. This could be:

- A single feature description
- A list of features
- User stories
- High-level requirements

If no input is provided, ask the user for their feature requirements.

## Output Format

Generate a JSON file with the following structure:

```json
{
  "prd": {
    "name": "<project or feature name>",
    "version": "1.0.0",
    "createdAt": "<ISO 8601 timestamp>",
    "items": [
      {
        "id": "<unique identifier, e.g., PRD-001>",
        "category": "<one of: Feature | Enhancement | Bug Fix | Technical | UX | Performance | Security>",
        "title": "<short descriptive title>",
        "description": "<detailed description of the requirement>",
        "acceptanceCriteria": [
          "<specific, measurable criterion 1>",
          "<specific, measurable criterion 2>"
        ],
        "stepsToVerify": [
          {
            "step": 1,
            "action": "<what to do>",
            "expected": "<what should happen>"
          }
        ],
        "priority": "<P0 | P1 | P2 | P3>",
        "passes": false
      }
    ]
  }
}
```

## Instructions

1. **Analyze the requirements**: Break down the input into discrete, testable items
2. **Categorize each item**: Assign the most appropriate category
3. **Write clear descriptions**: Be specific about what needs to be built
4. **Define acceptance criteria**: Use SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound where applicable)
5. **Create verification steps**: Write steps that a QA engineer could follow to verify the feature works
6. **Assign priority**:
   - P0: Critical/Blocker - Must have for launch
   - P1: High - Important for core functionality
   - P2: Medium - Nice to have
   - P3: Low - Future consideration
7. **Set passes to false**: All items start as unverified

## Guidelines for Acceptance Criteria

- Start with action verbs: "User can...", "System displays...", "API returns..."
- Include edge cases and error states
- Specify data validation rules
- Define performance expectations where relevant
- Include accessibility requirements for UI features

## Guidelines for Verification Steps

- Write steps that are reproducible
- Include setup/preconditions if needed
- Specify exact inputs and expected outputs
- Cover happy path and error scenarios

## Output

**IMPORTANT: Always create the JSON file automatically.**

1. Generate the PRD JSON structure based on user requirements
2. **Write the file immediately** to `./prd-plan.json` using the Write tool
3. If `prd-plan.json` already exists, merge new items with existing ones (increment IDs accordingly)

After generating and saving the file, summarize:

- File path where PRD was saved
- Total number of items
- Breakdown by category
- Breakdown by priority
- Any assumptions made

## Example Transformation

**Input**: "Users should be able to upload profile photos"

**Output item**:

```json
{
  "id": "PRD-001",
  "category": "Feature",
  "title": "Profile Photo Upload",
  "description": "Allow users to upload and update their profile photo. The photo should be displayed on their profile page and in navigation/comments where their avatar appears.",
  "acceptanceCriteria": [
    "User can upload JPG, PNG, or WebP images up to 5MB",
    "System validates file type and size before upload",
    "Uploaded image is resized to standard dimensions (200x200px)",
    "User sees upload progress indicator",
    "User can preview image before confirming",
    "Previous photo is replaced when new one is uploaded",
    "Photo displays correctly across all avatar locations"
  ],
  "stepsToVerify": [
    {
      "step": 1,
      "action": "Navigate to profile settings page",
      "expected": "Profile settings page loads with current avatar or placeholder"
    },
    {
      "step": 2,
      "action": "Click 'Upload Photo' button",
      "expected": "File picker dialog opens"
    },
    {
      "step": 3,
      "action": "Select a valid JPG image under 5MB",
      "expected": "Preview of cropped image appears with confirm/cancel options"
    },
    {
      "step": 4,
      "action": "Click confirm",
      "expected": "Upload progress shown, then success message. New photo visible."
    },
    {
      "step": 5,
      "action": "Attempt to upload a 10MB file",
      "expected": "Error message: 'File size must be under 5MB'"
    },
    {
      "step": 6,
      "action": "Attempt to upload a .exe file",
      "expected": "Error message: 'Please upload an image file (JPG, PNG, or WebP)'"
    }
  ],
  "priority": "P1",
  "passes": false
}
```

Now, please provide your feature requirements, and I will convert them into structured PRD items.
