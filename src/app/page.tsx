'use client';
import { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import styles from './page.module.css';

interface Flavor {
  name: string;
  quantity: number;
}

interface SubscriptionQuantity {
  [key: string]: number;
}

interface UserFlavor {
  [key: string]: number;
}

interface UserActions {
  allActions: string[];
  preferedQuantities: SubscriptionQuantity;
  preferedFlavors: UserFlavor;
  favoriteFlavor: string;
  totalAffinity: number;
  submitted: boolean;
}

const fetchedFlavors: Flavor[] = [
  { name: 'Smelly Sock', quantity: 0 },
  { name: 'Old Sneakers', quantity: 0 },
  { name: 'Rotten Veggies', quantity: 0 },
  { name: 'Sad Salad', quantity: 0 },
];

const INITIAL_QUANTITY = 30;

const Home = () => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(INITIAL_QUANTITY);
  const [totalQuantity, setTotalQuantity] = useState<number>(INITIAL_QUANTITY);
  const [flavors, setFlavors] = useState(fetchedFlavors);
  const [countIsValid, setCountIsValid] = useState(false);

  const mockUserActions: UserActions = {
    allActions: [] as string[],
    preferedQuantities: { '15': 0, '30': 0, '60': 0 },
    preferedFlavors: { 'Smelly Sock': 0, 'Old Sneakers': 0, 'Rotten Veggies': 0, 'Sad Salad': 0 },
    favoriteFlavor: '',
    totalAffinity: 0,
    submitted: false,
  };
  const [userActions, setUserActions] = useState(mockUserActions as UserActions);

  useEffect(() => {
    setSelectedQuantity(INITIAL_QUANTITY);
    handleQuantityChange({ target: { value: String(INITIAL_QUANTITY) } } as React.ChangeEvent<HTMLSelectElement>);
    setUserActions(mockUserActions);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log(userActions);
  });

  const handleQuantityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedQuantity = Number(event.target.value);
    setSelectedQuantity(newSelectedQuantity);

    let newFlavors = [] as Flavor[];
    const flavorsCount = fetchedFlavors.length;
    const quotient = Math.floor(newSelectedQuantity / flavorsCount);
    const remainder = newSelectedQuantity % flavorsCount;
    for (let i = 0; i < flavorsCount; i++) {
      let quantity: number = quotient;
      if (i < remainder) {
        quantity++;
      }
      newFlavors.push({ name: fetchedFlavors[i].name, quantity });
    }

    handleQuantityUserActions(newSelectedQuantity);

    setFlavors(newFlavors);
    setCountIsValid(true);
    setTotalQuantity(newSelectedQuantity);
  };

  const handleSingleChange = (flavorIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const eventType = Number(event.target.value) > flavors[flavorIndex].quantity ? 'added' : 'removed';
    const currentFlavor = flavors[flavorIndex];
    const newFlavors = [...flavors];
    currentFlavor.quantity = Number(event.target.value) > 0 ? Number(event.target.value) : 0;
    setFlavors(newFlavors);

    const totalQuantity = flavors.reduce((sum, flavor) => {
      return sum + flavor.quantity;
    }, 0);

    setTotalQuantity(totalQuantity);

    if (totalQuantity === selectedQuantity) {
      setCountIsValid(true);
    } else {
      setCountIsValid(false);
    }

    handleFlavorActions(eventType, currentFlavor);
  };

  const handleFlavorActions = (eventType?: string, currentFlavor?: Flavor) => {
    let newUserActions = userActions as UserActions;
    if (eventType && eventType === 'added') {
      newUserActions.allActions.push(
        `Added one ${currentFlavor?.name} flavor, quantity is now ${currentFlavor?.quantity}`
      );
    } else if (eventType && eventType === 'removed') {
      newUserActions.allActions.push(
        `Removed one ${currentFlavor?.name} flavor, quantity is now ${currentFlavor?.quantity}`
      );
    }
    if (currentFlavor) {
      newUserActions.preferedFlavors[currentFlavor?.name] =
        eventType === 'added'
          ? userActions.preferedFlavors[currentFlavor?.name] + 2
          : newUserActions.preferedFlavors[currentFlavor?.name]
          ? userActions.preferedFlavors[currentFlavor?.name] - 1
          : newUserActions.preferedFlavors[currentFlavor?.name];
    }

    const sumValues =
      Object.values(newUserActions.preferedFlavors).reduce((a, b) => a + b, 0) +
      Object.values(newUserActions.preferedQuantities).reduce((a, b) => a + b, 0);

    newUserActions.totalAffinity = sumValues > userActions.totalAffinity ? sumValues : userActions.totalAffinity;

    sumValues > 10
      ? (newUserActions.favoriteFlavor = Object.keys(newUserActions.preferedFlavors).reduce((a, b) =>
          newUserActions.preferedFlavors[a] > newUserActions.preferedFlavors[b] ? a : b
        ))
      : null;

    setUserActions(newUserActions);
  };

  const handleQuantityUserActions = (newSelectedQuantity: number) => {
    let newUserActions = userActions as UserActions;
    let selectedQuantityNewScore = userActions.preferedQuantities[newSelectedQuantity] + 1;

    newUserActions.preferedQuantities[String(newSelectedQuantity)] = selectedQuantityNewScore;
    newUserActions.allActions.push(`Changed subscription quantity to ${newSelectedQuantity}`),
      setUserActions(newUserActions);
  };

  const handleSubmitUserAction = (submitQuantity: number, submitFlavors: Flavor[]) => {
    let newUserActions = userActions as UserActions;
    let selectedQuantityNewScore = userActions.preferedQuantities[submitQuantity] + 5;

    newUserActions.allActions.push(
      `Submitted ${submitQuantity} smoothies with flavors: ${submitFlavors.map((flavor) => {
        return flavor.name + ': ' + flavor.quantity;
      })}`
    );
    newUserActions.preferedQuantities[String(submitQuantity)] = selectedQuantityNewScore;

    submitFlavors.map((flavor) => {
      newUserActions.preferedFlavors[flavor.name] = newUserActions.preferedFlavors[flavor.name] + flavor.quantity * 3;
    });

    setUserActions(newUserActions);
    return newUserActions;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const newUserActions = handleSubmitUserAction(selectedQuantity, flavors);

    event.preventDefault();

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    const body = {
      'Subscription quantity': selectedQuantity,
      Flavors: flavors,
      'User actions': newUserActions,
    };

    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    };

    fetch('https://eot73zbjloaxvds.m.pipedream.net', options)
      .then((response) => {
        console.log('Successful request: ', response);
      })
      .catch((error) => {
        console.error('Request failed: ', error);
      });

    setUserActions({ ...userActions, submitted: true });

    alert(`Your ${selectedQuantity} selected smoothies are on their way!`);
  };

  return (
    <main className={styles.main}>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="quantity">Select Subscription Quantity:</label>
          <select id="quantity" value={selectedQuantity} onChange={handleQuantityChange}>
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
          </select>
        </div>

        <h3>Flavors:</h3>
        {flavors.map((flavor, index) => (
          <div key={flavor.name}>
            <label htmlFor={`flavor-${index}`}>{flavor.name}:</label>
            <input id={`flavor-${index}`} type="number" value={flavor.quantity} onChange={handleSingleChange(index)} />
          </div>
        ))}
        {countIsValid ? (
          <div className={styles.submit}>
            <button type="submit">Submit</button>
          </div>
        ) : (
          <div className={styles.submit}>
            <button type="submit" disabled>
              Submit
            </button>
            <p className={styles.error}>Total quantity must be {selectedQuantity}</p>
            <p className={styles.error}>
              {totalQuantity > selectedQuantity && `Please remove ${totalQuantity - selectedQuantity} smoothies`}
              {totalQuantity < selectedQuantity && `Please add ${selectedQuantity - totalQuantity} smoothies`} or{' '}
              <span
                className={styles.reset}
                onClick={() =>
                  handleQuantityChange({
                    target: { value: String(selectedQuantity) },
                  } as React.ChangeEvent<HTMLSelectElement>)
                }
              >
                reset
              </span>
            </p>
          </div>
        )}
      </form>
      {userActions.totalAffinity > 15 && (
        <div
          className={styles.specialOffer}
          style={{
            backgroundColor:
              userActions.favoriteFlavor === 'Smelly Sock'
                ? 'darkslategray'
                : userActions.favoriteFlavor === 'Old Sneakers'
                ? 'darkred'
                : userActions.favoriteFlavor === 'Rotten Veggies'
                ? 'saddlebrown'
                : 'forestgreen',
          }}
        >
          <h3>
            High affinity detected! Use GET20 code at checkout and get a special discount on your favorite flavor:
          </h3>
          <h4>{userActions.favoriteFlavor} –20%</h4>
        </div>
      )}
      <div className={styles.userAffinity}>
        <h3>User affinity</h3>
        <h4>Prefered quantities:</h4>
        <ul>
          {Object.keys(userActions.preferedQuantities).map((quantity) => (
            <li key={quantity}>
              {quantity}: {userActions.preferedQuantities[quantity]}
              <div
                className={styles.affinityBar}
                style={{
                  width: `${userActions.preferedQuantities[quantity] * 10}px`,
                }}
              ></div>
            </li>
          ))}
        </ul>
        <h4>Prefered flavors:</h4>
        <ul>
          {Object.keys(userActions.preferedFlavors).map((flavor) => (
            <li key={flavor}>
              {flavor}: {userActions.preferedFlavors[flavor]}
              <div
                className={styles.affinityBar}
                style={{
                  width: `${Math.abs(userActions.preferedFlavors[flavor] * 2)}px`,
                  background: `${userActions.preferedFlavors[flavor] > 0 ? 'forestgreen' : 'crimson'}`,
                }}
              ></div>
            </li>
          ))}
        </ul>
        {
          <div className={styles.affinity}>
            <h4>Total affinity:</h4>
            <p>{`${userActions.totalAffinity}: ${
              userActions.totalAffinity < 1
                ? 'None'
                : userActions.totalAffinity < 15
                ? 'Low'
                : userActions.totalAffinity < 50
                ? 'Medium'
                : userActions.totalAffinity < 200
                ? 'High'
                : 'Extremely High'
            }`}</p>
            <div
              className={styles.affinityBar}
              style={{
                width: `${userActions.totalAffinity * 5}px`,
                background: `${
                  userActions.totalAffinity < 15
                    ? 'gray'
                    : userActions.totalAffinity < 50
                    ? 'gold'
                    : userActions.totalAffinity < 200
                    ? 'orange'
                    : 'crimson'
                }`,
              }}
            ></div>
          </div>
        }
        {userActions.allActions.length > 0 && (
          <div className={styles.actions}>
            <h4>All actions:</h4>
            <ul>
              {[...userActions.allActions].reverse().map((action, index) => (
                <li key={index}>{action.split('').length > 80 ? <strong>{action}</strong> : action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
